"use client";
import { FabricObject, Canvas, util } from "fabric";

export function setCanvasDimensionsToWindowSize(
  canvas: Canvas,
  overallContainer: HTMLDivElement
) {
  canvas.setDimensions({
    width: overallContainer.offsetWidth,
    height: overallContainer.offsetHeight,
  });
  canvas.requestRenderAll();
}

export function zoomToFitDocument(fabricCanvas: Canvas, documentRectangle: FabricObject) {
  const center = fabricCanvas.getCenterPoint();
  const scale = util.findScaleToFit(documentRectangle, fabricCanvas) * 0.9; // TODO: fix eyeballing
  fabricCanvas.zoomToPoint(center, scale);
  setCenterFromObject(fabricCanvas, documentRectangle);
  fabricCanvas.requestRenderAll();
}

export function zoomByDelta(canvas: Canvas, delta: number) {
  let zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 2) zoom = 2;
  if (zoom < 0.1) zoom = 0.1;
  const center = canvas.getCenterPoint();
  canvas.zoomToPoint(center, zoom);
  canvas.requestRenderAll();
}

export function panVerticallyByDelta(canvas: Canvas, documentRectangle: FabricObject, deltaX: number = 0, deltaY: number = 0) {
  const vpt = canvas.viewportTransform;
  vpt[4] -= deltaX;
  vpt[5] -= deltaY;
  canvas.setViewportTransform(vpt);
  // enclose(canvas, documentRectangle);
  canvas.requestRenderAll();
}

export function setCenterFromObject(fabricCanvas: Canvas, obj: FabricObject) {
  const objCenter = obj.getCenterPoint();
  const viewportTransform = fabricCanvas.viewportTransform;
  if (
    fabricCanvas.width === undefined ||
    fabricCanvas.height === undefined ||
    !viewportTransform
  ) {
    return;
  }
  viewportTransform[4] = fabricCanvas.width / 2 - objCenter.x * viewportTransform[0];
  viewportTransform[5] = fabricCanvas.height / 2 - objCenter.y * viewportTransform[3];
  fabricCanvas.setViewportTransform(viewportTransform);
  fabricCanvas.renderAll();
}

/******
 *
 *
 * adapted from https://github.com/fabricjs/fabric.js/discussions/7052
 */

export function enclose(canvas: Canvas, object: FabricObject) {
  const {
    br: brRaw, // bottom right
    tl: tlRaw, // top left
  } = object.aCoords;
  console.log('ENCLOSE');

  const T = canvas.viewportTransform;
  const br = brRaw.transform(T);
  const tl = tlRaw.transform(T);
  const { x: left, y: top } = tl;
  const { x: right, y: bottom } = br;
  const { width, height } = canvas;

  // calculate how far to translate to line up the edge of the object with
  // the edge of the canvas
  const transformedHeightOfObject = Math.abs(bottom - top);
  const transformedWidthOfObject = Math.abs(right - left);

  const yDistanceToMoveBottomOfObjectToTopOfScreen =
    top + transformedHeightOfObject;
  const yDistanceToMoveTopOfObjectToBottomOfScreen = top - height;

  // Percent of the document that shows when doc is dragged to the edges
  const PERCENT_OF_DOC_TO_PEEK = 0.05;
  const amountOfVerticalDocToShow =
    PERCENT_OF_DOC_TO_PEEK * transformedHeightOfObject;
  const amountOfHorizontalDocToShow =
    PERCENT_OF_DOC_TO_PEEK * transformedWidthOfObject;

  let dy = 0;
  const bottomOfDocIsOffscreen = bottom < amountOfVerticalDocToShow;
  const topOfDocIsOffscreen = top > height - amountOfVerticalDocToShow;
  if (bottomOfDocIsOffscreen) {
    dy =
      -yDistanceToMoveBottomOfObjectToTopOfScreen + amountOfVerticalDocToShow;
  } else if (topOfDocIsOffscreen) {
    dy =
      -yDistanceToMoveTopOfObjectToBottomOfScreen - amountOfVerticalDocToShow;
  }

  const xDistanceToMoveRightOfObjectToLeftOfScreen = right;
  const xDistanceToMoveLeftOfObjectToRightOfScreen = width - left;

  let dx = 0;
  const leftOfDocIsOffscreen = right < amountOfHorizontalDocToShow;
  const rightOfDocIsOffscreen = left > width - amountOfHorizontalDocToShow;
  if (leftOfDocIsOffscreen) {
    dx =
      -xDistanceToMoveRightOfObjectToLeftOfScreen + amountOfHorizontalDocToShow;
  } else if (rightOfDocIsOffscreen) {
    dx =
      xDistanceToMoveLeftOfObjectToRightOfScreen - amountOfHorizontalDocToShow;
  }

  if (dx || dy) {
    T[4] += dx;
    T[5] += dy;
    canvas.requestRenderAll();
  }
}