"use client";
import React from "react";
import { Canvas, FabricImage } from "fabric";
import { getFabricImageWithoutSrc } from "@/helpers/canvas-helpers";
import { SpreadItem, updateSpreadItem } from "@/helpers/indexdb";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

const AUTO_SAVE_DELAY_MS = 500;

function useAutoSaveCanvas(fabricCanvas: Canvas | null) {
  const [needsSaveTimeoutId, setNeedsSaveTimeoutId] =
    React.useState<NodeJS.Timeout | null>(null);
  const { setCurrentSpreadItems } = React.useContext(JournalContext);
  const onCanvasObjectModified = () => {
    console.log("object is modified");
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
      const newSpreadItems: Array<SpreadItem> = [];
      for (const object of allObjects) {
        const fabricImage = object as FabricImage;
        const fabricJsMetadata = getFabricImageWithoutSrc(
          fabricCanvas,
          fabricImage
        );
        if (!object.spreadItemId || !object.spreadId || !object.imageId) {
          continue;
        }
        const savePromise = updateSpreadItem(
          object.spreadItemId,
          object.spreadId,
          object.imageId,
          fabricJsMetadata
        );
        newSpreadItems.push({
          id: object.spreadItemId,
          spreadId: object.spreadId,
          imageId: object.imageId,
          fabricjsMetadata: fabricJsMetadata,
        });
        savePromises.push(savePromise);
      }
      setCurrentSpreadItems(newSpreadItems);
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
