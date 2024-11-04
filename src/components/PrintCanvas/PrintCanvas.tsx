"use client";
import React from "react";

import { FabricImage, Canvas, util, Rect, FabricObject } from "fabric";
import { FabricContext } from "../FabricContextProvider";
import {
  loadFabricImageInCanvas,
  setCanvasDimensionsToWindowSize,
  zoomToFitDocument,
} from "@/helpers/canvas-helpers";
import style from "./PrintCanvas.module.css";
import {
  augmentFabricImageWithSpreadItemMetadata,
  BACKGROUND_ID_VALUE,
} from "@/helpers/editable-object";

const DEFAULT_PPI = 300;
const DEFAULT_WIDTH_IN_INCHES = 8.5;
const DEFAULT_HEIGHT_IN_INCHES = 11;
const DEFAULT_DOC_WIDTH = DEFAULT_WIDTH_IN_INCHES * DEFAULT_PPI;
const DEFAULT_DOC_HEIGHT = DEFAULT_HEIGHT_IN_INCHES * DEFAULT_PPI;

function PrintCanvas() {
  const [fabricCanvas, initCanvas] = React.useContext(FabricContext);
  const overallContainer = React.useRef<HTMLDivElement>(null);
  const htmlCanvas = React.useRef<HTMLCanvasElement>(null);
  const [documentRectangle, setDocumentRectangle] =
    React.useState<FabricObject>();

  // Create the fabric canvas
  React.useEffect(() => {
    if (!htmlCanvas.current || !overallContainer.current) {
      return;
    }

    const newlyMadeCanvas = new Canvas(htmlCanvas.current, {
      controlsAboveOverlay: true,
      renderOnAddRemove: false,
      backgroundColor: 'gainsboro'
    });

    initCanvas(newlyMadeCanvas);
    console.log("vrk creating canvas");

    setCanvasDimensionsToWindowSize(newlyMadeCanvas, overallContainer.current);

    return () => {
      console.log("vrk dispose canvas");
      newlyMadeCanvas.dispose();
    };
  }, [overallContainer, htmlCanvas]);

  // Add Cousin Image to Fabric Canvas
  React.useEffect(() => {
    if (fabricCanvas) {
      console.log('what is happening');
      const rectangle = new Rect({
        id: `${BACKGROUND_ID_VALUE}`,
        stroke: "#4B624C",
        strokeWidth: 10,
        selectable: false,
        hasControls: false,
        height: DEFAULT_DOC_HEIGHT,
        width: DEFAULT_DOC_WIDTH,
        fill: "white",
        hoverCursor: "default",
      });

      rectangle.backgroundId = BACKGROUND_ID_VALUE;
      fabricCanvas.add(rectangle);
      fabricCanvas.centerObject(rectangle);
      setDocumentRectangle(rectangle);
      zoomToFitDocument(fabricCanvas, rectangle);
      fabricCanvas.requestRenderAll();
    }
    return () => {
      if (documentRectangle) {
        fabricCanvas?.remove(documentRectangle);
      }
    };
  }, [fabricCanvas]);

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
