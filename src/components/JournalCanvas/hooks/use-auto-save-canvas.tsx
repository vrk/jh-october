"use client";
import React from "react";
import { Canvas, FabricImage } from "fabric";
import { getFabricImageWithoutSrc } from "@/helpers/canvas-helpers";
import { updateSpreadItem } from "@/helpers/indexdb";

const AUTO_SAVE_DELAY_MS = 500;

function useAutoSaveCanvas(
  fabricCanvas: Canvas | null,
) {
  const [needsSaveTimeoutId, setNeedsSaveTimeoutId] =
    React.useState<NodeJS.Timeout | null>(null);
  const onCanvasObjectModified = () => {
    if (needsSaveTimeoutId) {
      clearTimeout(needsSaveTimeoutId);
    }
    const newTimeoutId = setTimeout(async () => {
      setNeedsSaveTimeoutId(null);

      if (!fabricCanvas) {
        return;
      }
      const allObjects = fabricCanvas.getObjects();
      const savePromises = [];
      for (const object of allObjects) {
        const fabricImage = object as FabricImage;
        const fabricJsMetadata = getFabricImageWithoutSrc(fabricCanvas, fabricImage);
        if (!object.spreadItemId || !object.spreadId || !object.imageId) {
          continue;
        }
        const savePromise = updateSpreadItem(
          object.spreadItemId,
          object.spreadId,
          object.imageId,
          fabricJsMetadata
        );
        savePromises.push(savePromise);
      }

      await Promise.all(savePromises);
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
  }, [fabricCanvas]);
}

export default useAutoSaveCanvas;
