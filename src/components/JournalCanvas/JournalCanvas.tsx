"use client";
import React from "react";

import { FabricImage, Canvas, util } from "fabric";
import { FabricContext } from "../FabricContextProvider";
import hobonichiCousinimage from "./images/hobonichi-cousin-spread.png";
import {
  addItemToCanvas,
  loadFabricImageInCanvas,
  setCanvasDimensionsToWindowSize,
  zoomToFitDocument,
} from "@/helpers/canvas-helpers";
import style from "./journalcanvas.module.css";
import useCanvasMousewheel from "./hooks/use-canvas-mousewheel";
import useCenterOnResize from "./hooks/use-center-on-resize";
import useCanvasPan from "./hooks/use-canvas-pan";
import useHotkeyZoom from "./hooks/use-hotkey-zoom";
import useHotkeyDeleteImage from "./hooks/use-hotkey-delete-image";
import useReceiveDragDropFromToolbox from "./hooks/use-receive-drag-drop-from-toolbox";
import useAutoSaveCanvas from "./hooks/use-auto-save-canvas";
import {
  augmentFabricImageWithSpreadItemMetadata,
  BACKGROUND_ID_VALUE,
} from "@/helpers/editable-object";
import { JournalImage, SpreadItem } from "@/helpers/data-types";

const DEFAULT_PPI = 300;
const DEFAULT_WIDTH_IN_INCHES = 5.8 * 2;
const DEFAULT_HEIGHT_IN_INCHES = 8.3;
const DEFAULT_DOC_WIDTH = DEFAULT_WIDTH_IN_INCHES * DEFAULT_PPI;
const DEFAULT_DOC_HEIGHT = DEFAULT_HEIGHT_IN_INCHES * DEFAULT_PPI;

type Props = {
  currentSpreadId: string;
  loadedImages: Array<JournalImage>;
  currentSpreadItems: Array<SpreadItem>;
};

function JournalCanvas({
  currentSpreadId,
  loadedImages,
  currentSpreadItems,
}: React.PropsWithoutRef<Props>) {
  const [fabricCanvas, initCanvas] = React.useContext(FabricContext);
  const overallContainer = React.useRef<HTMLDivElement>(null);
  const htmlCanvas = React.useRef<HTMLCanvasElement>(null);
  const [cousinHtmlImage, setCousinHtmlImage] =
    React.useState<HTMLImageElement>();
  const [documentRectangle, setDocumentRectangle] =
    React.useState<FabricImage>();
  const [isCousinLoaded, setIsCousinLoaded] = React.useState(false);

  useCanvasMousewheel(fabricCanvas, documentRectangle);
  useCenterOnResize(fabricCanvas, overallContainer, documentRectangle);
  useCanvasPan(fabricCanvas, documentRectangle);
  useHotkeyZoom(fabricCanvas, documentRectangle);
  useHotkeyDeleteImage(fabricCanvas);
  useAutoSaveCanvas(fabricCanvas);
  // Disable because too slow performance-wise
  // useSaveSpreadSnapshot(fabricCanvas, documentRectangle);
  const drop = useReceiveDragDropFromToolbox(fabricCanvas, documentRectangle);

  // Create the fabric canvas
  React.useEffect(() => {
    if (!htmlCanvas.current || !overallContainer.current) {
      return;
    }

    const newlyMadeCanvas = new Canvas(htmlCanvas.current, {
      controlsAboveOverlay: true,
      renderOnAddRemove: false,
    });

    initCanvas(newlyMadeCanvas);
    console.log("vrk creating canvas");

    setCanvasDimensionsToWindowSize(newlyMadeCanvas, overallContainer.current);

    return () => {
      console.log("vrk dispose canvas");
      newlyMadeCanvas.dispose();
    };
  }, [overallContainer, htmlCanvas]);

  // // Load Cousin Image
  React.useEffect(() => {
    loadCousinImage().then((cousinHtmlImage) => {
      setCousinHtmlImage(cousinHtmlImage);
    });
  }, []);

  // Add Cousin Image to Fabric Canvas
  React.useEffect(() => {
    if (fabricCanvas && cousinHtmlImage) {
      const rectangle = createFabricImageForCousin(cousinHtmlImage);
      rectangle.backgroundId = BACKGROUND_ID_VALUE;
      fabricCanvas.add(rectangle);
      fabricCanvas.centerObject(rectangle);
      setDocumentRectangle(rectangle);
      zoomToFitDocument(fabricCanvas, rectangle);
      fabricCanvas.requestRenderAll();
      setIsCousinLoaded(true);
    }
    return () => {
      if (documentRectangle) {
        fabricCanvas?.remove(documentRectangle);
      }
    };
  }, [cousinHtmlImage, fabricCanvas]);

  // Load Spread Items
  React.useEffect(() => {
    if (!fabricCanvas || !isCousinLoaded) {
      return;
    }
    const imagesCurrentlyUsedInSpread = loadedImages.filter(
      (image) => image.isUsedBySpreadId === currentSpreadId
    );
    for (const image of imagesCurrentlyUsedInSpread) {
      const spreadItem = currentSpreadItems.find(
        (spreadItem) => spreadItem.imageId === image.id
      );
      if (!spreadItem) {
        throw new Error("assertion error, spread item should be within images");
      }
      addItemToCanvas(fabricCanvas, spreadItem, image);
    }
  }, [fabricCanvas, isCousinLoaded]);

  const onCanvasBlur = () => {
    if (!fabricCanvas) {
      return;
    }
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
  };

  return (
    <div ref={drop as any} tabIndex={0} onBlur={onCanvasBlur}>
      <div ref={overallContainer} className={style.container}>
        <canvas ref={htmlCanvas}></canvas>
      </div>
    </div>
  );
}

function createFabricImageForCousin(backgroundImage: HTMLImageElement) {
  return new FabricImage(backgroundImage, {
    stroke: "#4B624C",
    strokeWidth: 0,
    selectable: false,
    hasControls: false,
    hoverCursor: "default",
  });
}

async function loadCousinImage(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = hobonichiCousinimage.src;
    image.width = DEFAULT_DOC_WIDTH;
    image.height = DEFAULT_DOC_HEIGHT;
    image.addEventListener("load", () => {
      resolve(image);
    });
  });
}

export default JournalCanvas;
