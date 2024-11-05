"use client";
import React from "react";

import { Canvas, Rect, FabricObject } from "fabric";
import { FabricContext } from "../FabricContextProvider";
import {
  setCanvasDimensionsToWindowSize,
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
  currentPrintPageId: string;
  loadedImages: Array<JournalImage>;
  currentPrintItems: Array<PrintItem>;
  allSpreadItems: Array<SpreadItem>;
};

function PrintCanvas({}: Props) {
  const [fabricCanvas, initCanvas] = React.useContext(FabricContext);
  const overallContainer = React.useRef<HTMLDivElement>(null);
  const htmlCanvas = React.useRef<HTMLCanvasElement>(null);
  const [documentRectangle, setDocumentRectangle] =
    React.useState<FabricObject>();

  useCanvasMousewheel(fabricCanvas, documentRectangle);
  useCenterOnResize(fabricCanvas, overallContainer, documentRectangle);
  useCanvasPan(fabricCanvas, documentRectangle);
  useHotkeyZoom(fabricCanvas, documentRectangle);

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

  // Add Document to Fabric Canvas
  React.useEffect(() => {
    if (fabricCanvas) {
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

  // Load print items
  React.useEffect(() => {
    if (!documentRectangle) {
      return;
    }

  }, [fabricCanvas, documentRectangle]);

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
