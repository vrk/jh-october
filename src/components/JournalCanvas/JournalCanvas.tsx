"use client";
import React from "react";

import { FabricImage, Canvas } from "fabric";
import { FabricContext } from "../FabricContextProvider";
import hobonichiCousinimage from "./images/hobonichi-cousin-spread.png";
import {
  addFabricImageToCanvas,
  fitFabricImageToRectangle,
  setCanvasDimensionsToWindowSize,
  zoomToFitDocument,
} from "@/helpers/canvas-helpers";
import style from "./journalcanvas.module.css";
import useCanvasMousewheel from "./hooks/use-canvas-mousewheel";
import useCenterOnResize from "./hooks/use-center-on-resize";
import useCanvasPan from "./hooks/use-canvas-pan";
import useHotkeyZoom from "./hooks/use-hotkey-zoom";
import useHotkeyDeleteImage from "./hooks/use-hotkey-delete-image";
import { useDrop } from "react-dnd";
import { THUMBNAIL_DRAG_ACCEPT_TYPE, ThumbnailDragParameteters } from "@/helpers/drag-and-drop-helpers";
import { createSpreadItem, getPhotoById } from "@/helpers/indexdb";
import { JournalContext } from "../JournalContextProvider/JournalContextProvider";
import { augmentFabricImageWithSpreadItemMetadata } from "@/helpers/editable-object";

const DEFAULT_PPI = 300;
const DEFAULT_WIDTH_IN_INCHES = 5.8 * 2;
const DEFAULT_HEIGHT_IN_INCHES = 8.3;
const DEFAULT_DOC_WIDTH = DEFAULT_WIDTH_IN_INCHES * DEFAULT_PPI;
const DEFAULT_DOC_HEIGHT = DEFAULT_HEIGHT_IN_INCHES * DEFAULT_PPI;

function JournalCanvas() {
  const [fabricCanvas, initCanvas] = React.useContext(FabricContext);
  const { journalId, currentSpreadId, currentSpreadItems, setCurrentSpreadItems } = React.useContext(JournalContext);

  const overallContainer = React.useRef<HTMLDivElement>(null);
  const htmlCanvas = React.useRef<HTMLCanvasElement>(null);

  const [cousinHtmlImage, setCousinHtmlImage] =
    React.useState<HTMLImageElement>();
  const [documentRectangle, setDocumentRectangle] =
    React.useState<FabricImage>();

  useCanvasMousewheel(fabricCanvas, documentRectangle);
  useCenterOnResize(fabricCanvas, overallContainer, documentRectangle);
  useCanvasPan(fabricCanvas, documentRectangle);
  useHotkeyZoom(fabricCanvas, documentRectangle);
  useHotkeyDeleteImage(fabricCanvas);
  const [_, drop] = useDrop(() => ({
    accept: THUMBNAIL_DRAG_ACCEPT_TYPE,
    drop: async ( { id }: ThumbnailDragParameteters ) => {
      console.log("dropped", id);
      if (!fabricCanvas || !documentRectangle || !journalId || !currentSpreadId) {
        return;
      }
      const image = await getPhotoById(id);
      const fabricImage = await FabricImage.fromURL(image.dataUrl);
      fitFabricImageToRectangle(documentRectangle, fabricImage);

      // TODO: Add FabricJs metadata!!
      const spreadItem = await createSpreadItem(currentSpreadId, image.id, null);
      augmentFabricImageWithSpreadItemMetadata(fabricImage, spreadItem);
      addFabricImageToCanvas(fabricCanvas, fabricImage);
      console.log('we are setting the current spread items now');
      setCurrentSpreadItems([
        ...currentSpreadItems,
        spreadItem
      ]);
    },
  }), [documentRectangle, fabricCanvas]);

  // Create the fabric canvas
  React.useEffect(() => {
    if (!htmlCanvas.current || !overallContainer.current) {
      return;
    }

    console.log("vrk create canvas");
    const newlyMadeCanvas = new Canvas(htmlCanvas.current, {
      controlsAboveOverlay: true,
      renderOnAddRemove: false,
    });

    initCanvas(newlyMadeCanvas);

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
  }, [cousinHtmlImage, fabricCanvas]);

  return (
    <div ref={drop as any}>
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
