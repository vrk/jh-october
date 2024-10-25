"use client";
import React from "react";
import { Canvas, FabricImage, ImageFormat } from "fabric";
import {
  addFabricImageToCanvas,
  getFabricImageWithoutSrc,
} from "@/helpers/canvas-helpers";
import {
  BACKGROUND_ID_VALUE,
  PROPERTIES_TO_INCLUDE_IN_CLONES,
} from "@/helpers/editable-object";

const AUTO_SAVE_DELAY_MS = 500;

function useSaveSpreadSnapshot(
  fabricCanvas: Canvas | null,
  documentRectangle: FabricImage | undefined
) {
  const [needsSaveTimeoutId, setNeedsSaveTimeoutId] =
    React.useState<NodeJS.Timeout | null>(null);

  const onCanvasObjectModified = () => {
    console.log("modified");
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
      const [clonedBackground] = clonedCanvas
        .getObjects()
        .filter((o) => o.backgroundId === BACKGROUND_ID_VALUE);
      if (!clonedBackground) {
        new Error("assertion error");
      }

      clonedCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      const { top, left, width, height } = clonedBackground.getBoundingRect();
      const format: ImageFormat = "png";
      const options = {
        name: "New Image",
        format,
        quality: 1,
        width,
        height,
        left,
        top,
        multiplier: 0.25,
      };
      const dataUrl = clonedCanvas.toDataURL(options);

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "my-pic.png";
      link.click();
    }, AUTO_SAVE_DELAY_MS);
    setNeedsSaveTimeoutId(newTimeoutId);
  };
  const canvasEventHandlers = {
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
  }, [fabricCanvas, documentRectangle]);
}

export default useSaveSpreadSnapshot;
