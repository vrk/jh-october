"use client";
import React from "react";
import { FabricImage, FabricObject, Canvas, Rect, util } from "fabric";
import { FabricContext } from "../FabricContextProvider";
import hobonichiCousinimage from "./images/hobonichi-cousin-spread.png";
import style from "./journalcanvas.module.css";

const DEFAULT_PPI = 300;
const DEFAULT_WIDTH_IN_INCHES = 5.8 * 2;
const DEFAULT_HEIGHT_IN_INCHES = 8.3;
const DEFAULT_DOC_WIDTH = DEFAULT_WIDTH_IN_INCHES * DEFAULT_PPI;
const DEFAULT_DOC_HEIGHT = DEFAULT_HEIGHT_IN_INCHES * DEFAULT_PPI;

function JournalCanvas() {
  const [fabricCanvas, initCanvas] = React.useContext(FabricContext);

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

    const newlyMadeCanvas = new Canvas(htmlCanvas.current, {
      controlsAboveOverlay: true,
      renderOnAddRemove: false,
    });

    initCanvas(newlyMadeCanvas);

    setCanvasDimensionsToWindowSize(
      newlyMadeCanvas,
      overallContainer.current
    );


    return () => {
      console.log('vrk dispose canvas')
      newlyMadeCanvas.dispose();
    };
  }, [overallContainer, htmlCanvas]);

  // // Load Cousin Image
  React.useEffect(() => {
    loadCousinImage().then((cousinHtmlImage) => {
      console.log("setting");
      setCousinHtmlImage(cousinHtmlImage);
    });
  }, []);

  // Add Cousin Image to Fabric Canvas
  React.useEffect(() => {
    if (fabricCanvas && cousinHtmlImage) {
      const rectangle = createBackgroundImage(cousinHtmlImage);
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
    <div ref={overallContainer} className={style.container}>
      <canvas ref={htmlCanvas}></canvas>
    </div>
  );
}

function createBackgroundImage(backgroundImage: HTMLImageElement) {
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

function setCanvasDimensionsToWindowSize(
  canvas: Canvas,
  overallContainer: HTMLDivElement
) {
  console.log('setting dimensions')
  canvas.setDimensions({
    width: overallContainer.offsetWidth,
    height: overallContainer.offsetHeight,
  });
  canvas.requestRenderAll();
}

function zoomToFitDocument(fabricCanvas: Canvas, documentRectangle: FabricObject) {
  const center = fabricCanvas.getCenterPoint();
  const scale = util.findScaleToFit(documentRectangle, fabricCanvas) * 0.9; // TODO: fix eyeballing
  fabricCanvas.zoomToPoint(center, scale);
  setCenterFromObject(fabricCanvas, documentRectangle);
  fabricCanvas.requestRenderAll();
}

function setCenterFromObject(fabricCanvas: Canvas, obj: FabricObject) {
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

export default JournalCanvas;
