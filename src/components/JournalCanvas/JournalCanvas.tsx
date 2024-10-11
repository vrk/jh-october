"use client";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { FabricImage, Canvas } from "fabric";
import { FabricContext } from "../FabricContextProvider";
import hobonichiCousinimage from "./images/hobonichi-cousin-spread.png";
import {
  setCanvasDimensionsToWindowSize,
  zoomToFitDocument,
  setCenterFromObject,
  zoomByDelta,
  panVerticallyByDelta,
} from "@/helpers/canvas-helpers";
import style from "./journalcanvas.module.css";

const DEFAULT_PPI = 300;
const DEFAULT_WIDTH_IN_INCHES = 5.8 * 2;
const DEFAULT_HEIGHT_IN_INCHES = 8.3;
const DEFAULT_DOC_WIDTH = DEFAULT_WIDTH_IN_INCHES * DEFAULT_PPI;
const DEFAULT_DOC_HEIGHT = DEFAULT_HEIGHT_IN_INCHES * DEFAULT_PPI;

function JournalCanvas() {
  const [fabricCanvas, initCanvas] = React.useContext(FabricContext);
  const [isAltKeyPressed, setIsAltKeyPressed] = React.useState(false);
  useHotkeys("meta", () => setIsAltKeyPressed(true), [isAltKeyPressed], {
    keydown: true,
  });
  useHotkeys("meta", () => setIsAltKeyPressed(false), [isAltKeyPressed], {
    keyup: true,
  });

  console.log("rerender", fabricCanvas);

  const overallContainer = React.useRef<HTMLDivElement>(null);
  const htmlCanvas = React.useRef<HTMLCanvasElement>(null);

  const [cousinHtmlImage, setCousinHtmlImage] =
    React.useState<HTMLImageElement>();
  const [documentRectangle, setDocumentRectangle] =
    React.useState<FabricImage>();

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

  // Add resize handler
  React.useEffect(() => {
    const onWindowResize = () => {
      if (!fabricCanvas || !overallContainer.current || !documentRectangle) {
        return;
      }
      setCanvasDimensionsToWindowSize(fabricCanvas, overallContainer.current);
      setCenterFromObject(fabricCanvas, documentRectangle);
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, [fabricCanvas, overallContainer, documentRectangle]);

  // Add mousewheel handler
  React.useEffect(() => {
    if (!fabricCanvas) {
      return;
    }

    const onMouseWheel = (opt: any) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();
      const delta = opt.e.deltaY;
      if (isAltKeyPressed) {
        zoomByDelta(fabricCanvas, delta);
      } else {
        panVerticallyByDelta(fabricCanvas, delta);
      }
    };
    fabricCanvas.on("mouse:wheel", onMouseWheel);
    return () => {
      fabricCanvas.off("mouse:wheel", onMouseWheel);
    };
  }, [fabricCanvas, isAltKeyPressed]);

  return (
    <div ref={overallContainer} className={style.container}>
      <canvas ref={htmlCanvas}></canvas>
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
