"use client";
import React from "react";

import { Canvas, Rect, FabricObject, util } from "fabric";
import { FabricContext } from "../FabricContextProvider";
import {
  addItemToCanvas,
  setCanvasDimensionsToWindowSize,
  setCenterFromObject,
  zoomToFitDocument,
} from "@/helpers/canvas-helpers";
import style from "./PrintCanvas.module.css";
import { BACKGROUND_ID_VALUE } from "@/helpers/editable-object";
import useCanvasMousewheel from "../JournalCanvas/hooks/use-canvas-mousewheel";
import useCenterOnResize from "../JournalCanvas/hooks/use-center-on-resize";
import useCanvasPan from "../JournalCanvas/hooks/use-canvas-pan";
import useHotkeyZoom from "../JournalCanvas/hooks/use-hotkey-zoom";
import { JournalImage, PrintItem, SpreadItem } from "@/helpers/data-types";

const DEFAULT_PPI = 300;
const DEFAULT_WIDTH_IN_INCHES = 8.5;
const DEFAULT_HEIGHT_IN_INCHES = 11;
const DEFAULT_DOC_WIDTH = DEFAULT_WIDTH_IN_INCHES * DEFAULT_PPI;
const DEFAULT_DOC_HEIGHT = DEFAULT_HEIGHT_IN_INCHES * DEFAULT_PPI;

type Props = {
  loadedImages: Array<JournalImage>;
  allSpreadItems: Array<SpreadItem>;
};

function PrintCanvas({ loadedImages, allSpreadItems }: Props) {
  const [fabricCanvas, initCanvas] = React.useContext(FabricContext);
  const overallContainer = React.useRef<HTMLDivElement>(null);
  const htmlCanvas = React.useRef<HTMLCanvasElement>(null);
  const [documentRectangles, setDocumentRectangles] = React.useState<
    Array<FabricObject>
  >([]);

  const [firstDoc] = documentRectangles;
  useCanvasMousewheel(fabricCanvas, firstDoc);
  useCenterOnResize(fabricCanvas, overallContainer, firstDoc);
  useCanvasPan(fabricCanvas, firstDoc);
  useHotkeyZoom(fabricCanvas, firstDoc);

  // Create the fabric canvas
  React.useEffect(() => {
    if (!htmlCanvas.current || !overallContainer.current) {
      return;
    }

    const newlyMadeCanvas = new Canvas(htmlCanvas.current, {
      controlsAboveOverlay: true,
      renderOnAddRemove: false,
      backgroundColor: "gainsboro",
    });

    initCanvas(newlyMadeCanvas);
    setCanvasDimensionsToWindowSize(newlyMadeCanvas, overallContainer.current);

    return () => {
      newlyMadeCanvas.dispose();
    };
  }, [overallContainer, htmlCanvas]);

  function createNewDocument(fabricCanvas: Canvas) {
    const newDocRect = new Rect({
      id: `${BACKGROUND_ID_VALUE}-${documentRectangles.length}`,
      stroke: "#4B624C",
      strokeWidth: 10,
      selectable: false,
      hasControls: false,
      height: DEFAULT_DOC_HEIGHT,
      width: DEFAULT_DOC_WIDTH,
      fill: "white",
      hoverCursor: "default",
    });
    const newDocs = [...documentRectangles, newDocRect]
    setDocumentRectangles(newDocs);
    fabricCanvas.add(newDocRect);
    if (newDocs.length === 1) {
      fabricCanvas.centerObject(newDocRect);
      zoomToFitDocument(fabricCanvas, newDocRect);
    } else if (documentRectangles.length > 1) {
      const lastPage = documentRectangles[documentRectangles.length - 1];
      newDocRect.setX(lastPage.getX());
      newDocRect.setY(lastPage.getY() + 200 + newDocRect.height);
      newDocRect.setCoords();
    }
    fabricCanvas.requestRenderAll();
  }



  // Add Document to Fabric Canvas
  React.useEffect(() => {
    if (!fabricCanvas) {
      return;
    }
    createNewDocument(fabricCanvas);
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
    // Best-Fit Decreasing Height (BFDH) algorithm
    // BFDH packs the next item R (in non-increasing height) on the level, among those
    // that can accommodate R, for which the residual horizontal space is the minimum.
    // If no level can accommodate R, a new level is created.
    return () => {
      fabricCanvas.clear();
    };
  }, [fabricCanvas, allSpreadItems]);

  const onCanvasBlur = () => {
    if (!fabricCanvas) {
      return;
    }
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
  };

  return (
    <div tabIndex={0} onBlur={onCanvasBlur}>
      <div ref={overallContainer} className={style.container}>
        <canvas ref={htmlCanvas}></canvas>
      </div>
    </div>
  );
}

export default PrintCanvas;
