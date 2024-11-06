"use client";
import React from "react";

import { Canvas, Rect, FabricObject, util, FabricImage } from "fabric";
import { FabricContext } from "../FabricContextProvider";
import {
  addItemToCanvas,
  getFabricImage,
  loadFabricImageInCanvas,
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

const PRINT_MARGIN_IN_INCHES = 0.25;
const PRINT_MARGIN = PRINT_MARGIN_IN_INCHES * DEFAULT_PPI;
const SPACE_IN_BETWEEN_ROW_IN_INCHES = 0.1;
const SPACE_IN_BETWEEN_ROWS = SPACE_IN_BETWEEN_ROW_IN_INCHES * DEFAULT_PPI;
const SPACE_IN_BETWEEN_IMAGES_IN_INCHES = 0.1;
const SPACE_IN_BETWEEN_IMAGES = SPACE_IN_BETWEEN_IMAGES_IN_INCHES * DEFAULT_PPI;

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
    const newDocs = [...documentRectangles, newDocRect];
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
    return newDocRect;
  }

  type PrintImage = {
    spreadItem: SpreadItem;
    image: JournalImage;
    fabricImage: FabricImage;
  };
  function sortImagesByHeightDescending(printImages: Array<PrintImage>) {
    printImages.sort((a, b) => {
      return b.fabricImage.getScaledHeight() - a.fabricImage.getScaledHeight();
    });
  }
  async function createPrintImages() {
    const printImages: Array<PrintImage> = [];
    for (const spreadItem of allSpreadItems) {
      const image = loadedImages.find(
        (i) => i.isUsedBySpreadItemId == spreadItem.id
      );
      if (image === undefined) {
        continue;
      }
      // TODO: convert to Promise.all
      const fabricObject = await getFabricImage(spreadItem, image);
      printImages.push({
        spreadItem,
        image,
        fabricImage: fabricObject,
      });
    }
    return printImages;
  }

  type PrintRow = {
    printImages: Array<PrintImage>;
    heightInPixels: number;
    widthInPixels: number;
  };

  // PASS ONE:
  // Following Best-Fit Decreasing Height (BFDH) algorithm for strip packing.
  // BFDH packs the next item R (in non-increasing height) on the level, among those
  // that can accommodate R, for which the residual horizontal space is the minimum.
  // If no level can accommodate R, a new level is created.
  async function layOutPhotosInRow(printImages: Array<PrintImage>) {
    sortImagesByHeightDescending(printImages);
    const rows: Array<PrintRow> = [];
    const maxRowWidth = DEFAULT_DOC_WIDTH - PRINT_MARGIN * 2;

    const findRowForImage = (printImage: PrintImage) => {
      let bestRow = null;
      let bestRowHeightDelta = null;
      for (const row of rows) {
        const imageWidth = printImage.fabricImage.getScaledWidth();
        const imageHeight = printImage.fabricImage.getScaledHeight();
        const newWidth = row.widthInPixels + imageWidth;
        if (newWidth > maxRowWidth) {
          continue;
        }
        const heightDelta = row.heightInPixels - imageHeight;
        if (bestRowHeightDelta === null || heightDelta < bestRowHeightDelta) {
          bestRow = row;
          bestRowHeightDelta = heightDelta;
        }
      }
      return bestRow;
    };
    for (const printImage of printImages) {
      console.log(printImage.fabricImage.getScaledHeight());
      // addItemToCanvas(fabricCanvas, printImage.spreadItem, printImage.image);
      const row = findRowForImage(printImage);
      if (row) {
        // Update the row width. Always add SPACE_IN_BETWEEN_IMAGES, because if there's
        // an existing row, there's an existing image.
        row.printImages.push(printImage);
        row.widthInPixels +=
          printImage.fabricImage.getScaledWidth() + SPACE_IN_BETWEEN_IMAGES;
      } else {
        // Add a new row
        const newPrintRow = {
          printImages: [printImage],
          heightInPixels: printImage.fabricImage.getScaledHeight(),
          widthInPixels: printImage.fabricImage.getScaledWidth(),
        };
        rows.push(newPrintRow);
      }
    }
    return rows;
  }

  type PrintPage = {
    rows: Array<PrintRow>;
    heightInPixels: number;
  };
  // PASS TWO
  // In the first phase, a strip packing is obtained by the FFDH algorithm. The second phase
  // adopts the First-Fit Decreasing (FFD) algorithm, which packs an item to the first bin
  // that it fits or start a new bin otherwise.
  function layOutRowsInPages(rows: Array<PrintRow>) {
    const pages: Array<PrintPage> = [];
    const maxPageHeight = DEFAULT_DOC_HEIGHT - PRINT_MARGIN * 2;
    const findPageForRow = (row: PrintRow) => {
      for (const page of pages) {
        const newHeight = page.heightInPixels + row.heightInPixels;
        if (newHeight > maxPageHeight) {
          continue;
        }
        return page;
      }
      return null;
    };
    for (const row of rows) {
      const page = findPageForRow(row);
      if (page) {
        page.rows.push(row);
        // Always add space because if there's an existing page, there's already a row present.
        page.heightInPixels += row.heightInPixels + SPACE_IN_BETWEEN_ROWS;
      } else {
        const newPage = {
          rows: [row],
          heightInPixels: row.heightInPixels,
        };
        pages.push(newPage);
      }
    }
    return pages;
  }

  async function layOutPhotos(fabricCanvas: Canvas) {
    const printImages = await createPrintImages();
    const rows = await layOutPhotosInRow(printImages);
    const pages = layOutRowsInPages(rows);
    for (const page of pages) {
      const document = createNewDocument(fabricCanvas);
      let left = document.left + PRINT_MARGIN;
      let top = document.top + PRINT_MARGIN;
      for (const row of page.rows) {
        for (const printImage of row.printImages) {
          printImage.fabricImage.left = left;
          printImage.fabricImage.top = top;
          loadFabricImageInCanvas(fabricCanvas, printImage.fabricImage);
          left += printImage.fabricImage.getScaledWidth() + SPACE_IN_BETWEEN_IMAGES;
        }
        top += row.heightInPixels + SPACE_IN_BETWEEN_ROWS;
      }
    }
  }

  // Add Document to Fabric Canvas
  React.useEffect(() => {
    if (!fabricCanvas) {
      return;
    }
    layOutPhotos(fabricCanvas);
    // for (const spreadItem of allSpreadItems) {
    //   const image = loadedImages.find(
    //     (i) => i.isUsedBySpreadItemId === spreadItem.id
    //   );
    //   if (!image) {
    //     throw new Error(
    //       "assertion error -- all spread items should have a corresponding image"
    //     );
    //   }
    //   addItemToCanvas(fabricCanvas, spreadItem, image);
    // }
    // Best-Fit Decreasing Height (BFDH) algorithm
    // BFDH packs the next item R (in non-increasing height) on the level, among those
    // that can accommodate R, for which the residual horizontal space is the minimum.
    // If no level can accommodate R, a new level is created.
    return () => {
      fabricCanvas.clear();
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
