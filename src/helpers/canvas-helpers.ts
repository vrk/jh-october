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

export function panVerticallyByDelta(canvas: Canvas, deltaX: number = 0, deltaY: number = 0) {
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

