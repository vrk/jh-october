"use client";
import { FabricImage, FabricObject, Canvas, util, filters } from "fabric";
import {
  augmentFabricImageWithSpreadItemMetadata,
  setEditableObjectProperties,
} from "./editable-object";
import {
  FabricJsMetadata,
  JournalImage,
  PrintItem,
  SpreadItem,
} from "./data-types";

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

export function zoomToFitDocument(
  fabricCanvas: Canvas,
  documentRectangle: FabricObject
) {
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

export function panVerticallyByDelta(
  canvas: Canvas,
  documentRectangle: FabricObject,
  deltaX: number = 0,
  deltaY: number = 0
) {
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
  viewportTransform[4] =
    fabricCanvas.width / 2 - objCenter.x * viewportTransform[0];
  viewportTransform[5] =
    fabricCanvas.height / 2 - objCenter.y * viewportTransform[3];
  fabricCanvas.setViewportTransform(viewportTransform);
  fabricCanvas.renderAll();
}

export function fitFabricImageToRectangle(
  documentRectangle: FabricObject,
  fabricImage: FabricImage
) {
  const scale = util.findScaleToFit(fabricImage, documentRectangle) * 0.9;
  if (scale < 1) {
    fabricImage.scale(scale);
  }
}

export function addFabricImageToCanvas(
  canvas: Canvas,
  fabricImage: FabricImage
) {
  setEditableObjectProperties(fabricImage);
  canvas.add(fabricImage);
  canvas.bringObjectToFront(fabricImage);
  canvas.viewportCenterObject(fabricImage);
  canvas.setActiveObject(fabricImage);
  const resizeFilter = new filters.Resize();
  resizeFilter.resizeType = "lanczos";
  fabricImage.applyFilters([resizeFilter]);
  canvas.requestRenderAll();
}

export function loadFabricImageInCanvas(
  canvas: Canvas,
  fabricImage: FabricImage
) {
  setEditableObjectProperties(fabricImage);
  canvas.add(fabricImage);
  canvas.bringObjectToFront(fabricImage);
  const resizeFilter = new filters.Resize();
  resizeFilter.resizeType = "lanczos";
  fabricImage.applyFilters([resizeFilter]);
  canvas.requestRenderAll();
}

function getActualTopLeftCoordinates(group: FabricObject, image: FabricImage) {
  const objectLeft = image.left;
  const objectTop = image.top;
  const groupLeft = group.left;
  const groupTop = group.top;
  const objectInGroupLeft = objectLeft + groupLeft + group.width / 2;
  const objectInGroupTop = objectTop + groupTop + group.height / 2;
  return {
    objectInGroupLeft,
    objectInGroupTop,
  };
}

export function getFabricImageWithoutSrc(
  fabricCanvas: Canvas,
  fabricImage: FabricImage
): FabricJsMetadata {
  const metadataWithSrc = fabricImage.toObject();
  console.log("TO OBJECT");

  // Get all the metadata for the fabricImage, EXCEPT for the src
  const { src, ...fabricJsMetadata } = metadataWithSrc;

  // If this object part of a group selection, its top and left values are calculated relative to the group selection.
  // We don't want to save _those_ values; we want to save its actual top and left coordinates. So check for this scenario
  // and get the actual top & left if we're part of a selection.
  // https://stackoverflow.com/questions/71356612/why-top-and-left-properties-become-negative-after-selection-fabricjs
  const activeSelection = fabricCanvas.getActiveObject();
  if (
    activeSelection &&
    activeSelection.type.toLowerCase() === "activeselection"
  ) {
    const { objectInGroupLeft, objectInGroupTop } = getActualTopLeftCoordinates(
      activeSelection,
      fabricImage
    );
    fabricJsMetadata.top = objectInGroupTop;
    fabricJsMetadata.left = objectInGroupLeft;
  }

  return fabricJsMetadata;
}

export function addAllSpreadItemsToCanvas(
  fabricCanvas: Canvas,
  allSpreadItems: Array<SpreadItem>,
  loadedImages: Array<JournalImage>
) {
  for (const spreadItem of allSpreadItems) {
    const image = loadedImages.find(
      (i) => i.isUsedBySpreadItemId === spreadItem.id
    );
    if (!image) {
      throw new Error(
        "assertion error -- all spread items should have a corresponding image"
      );
    }
    addItemToCanvas(fabricCanvas, spreadItem, image);
  }
}

export async function getFabricImage(
  spreadItem: SpreadItem,
  image: JournalImage
) {
  const fabricObjectData = spreadItem.fabricjsMetadata;
  fabricObjectData.src = image.dataUrl;
  // TODO: See if there's benefit of doing this all in a batch
  const [object] = await util.enlivenObjects([fabricObjectData]);
  const fabricImage = object as FabricImage;
  augmentFabricImageWithSpreadItemMetadata(fabricImage, spreadItem);
  return fabricImage;
}

export async function addItemToCanvas(
  fabricCanvas: Canvas,
  spreadItem: SpreadItem,
  image: JournalImage
) {
  const fabricImage = await getFabricImage(spreadItem, image);
  loadFabricImageInCanvas(fabricCanvas, fabricImage);
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
  console.log("ENCLOSE");

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
