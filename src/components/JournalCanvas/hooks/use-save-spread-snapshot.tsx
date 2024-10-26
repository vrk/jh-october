"use client";
import React from "react";
import { Canvas, FabricImage, ImageFormat, filters } from "fabric";
import {
  BACKGROUND_ID_VALUE,
  PROPERTIES_TO_INCLUDE_IN_CLONES,
} from "@/helpers/editable-object";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";
import { updateSpreadThumbnail } from "@/helpers/indexdb";

const AUTO_SAVE_DELAY_MS = 500;

function useSaveSpreadSnapshot(
  fabricCanvas: Canvas | null,
  documentRectangle: FabricImage | undefined
) {
  const { allSpreads, setAllSpreads, currentSpreadId } =
    React.useContext(JournalContext);
  const [needsSaveTimeoutId, setNeedsSaveTimeoutId] =
    React.useState<NodeJS.Timeout | null>(null);

  const onCanvasObjectModified = () => {
    if (needsSaveTimeoutId) {
      clearTimeout(needsSaveTimeoutId);
    }
    const newTimeoutId = setTimeout(async () => {
      setNeedsSaveTimeoutId(null);

      if (!fabricCanvas || !documentRectangle) {
        return;
      }
      const clonedCanvas = await fabricCanvas.clone(
        PROPERTIES_TO_INCLUDE_IN_CLONES
      );
      console.log('CLONE');
      const [clonedBackground] = clonedCanvas
        .getObjects()
        .filter((o) => o.backgroundId === BACKGROUND_ID_VALUE);
      if (!clonedBackground) {
        new Error("assertion error");
      }

      clonedCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      for (const object of clonedCanvas.getObjects()) {
        if (object.backgroundId) {
          continue;
        }
        const fabricImage = object as FabricImage;
        const resizeFilter = new filters.Resize();
        resizeFilter.resizeType = "lanczos";
        fabricImage.applyFilters([resizeFilter]);
      }

      const { top, left, width, height } = clonedBackground;
      const format: ImageFormat = "png";
      const options = {
        name: "New Image",
        format,
        quality: 1,
        width,
        height,
        left,
        top,
        multiplier: 0.2,
      };
      const dataUrl = clonedCanvas.toDataURL(options);
      const [currentSpread] = allSpreads.filter(
        (s) => s.id === currentSpreadId
      );
      if (!currentSpread) {
        throw new Error("assertion error");
      }
      await updateSpreadThumbnail(
        currentSpread,
        dataUrl,
        clonedCanvas.width,
        clonedCanvas.height
      );
      currentSpread.previewThumbUrl = dataUrl;
      currentSpread.previewThumbWidth = clonedCanvas.width;
      currentSpread.previewThumbHeight = clonedCanvas.height;
      setAllSpreads([...allSpreads]);
    }, AUTO_SAVE_DELAY_MS);
    setNeedsSaveTimeoutId(newTimeoutId);
  };
  const canvasEventHandlers = {
    "object:added": onCanvasObjectModified,
    "object:removed": onCanvasObjectModified,
    "object:modified": onCanvasObjectModified,
  };

  React.useEffect(() => {
    if (!fabricCanvas) {
      return;
    }
    fabricCanvas.on(canvasEventHandlers);
    return () => {
      fabricCanvas.off(canvasEventHandlers);
    };
  }, [fabricCanvas, documentRectangle, allSpreads, currentSpreadId]);
}

export default useSaveSpreadSnapshot;
