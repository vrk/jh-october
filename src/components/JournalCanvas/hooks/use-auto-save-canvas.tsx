"use client";
import React from "react";
import { ActiveSelection, Canvas, FabricImage } from "fabric";
import { getFabricImageWithoutSrc } from "@/helpers/canvas-helpers";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

function useAutoSaveCanvas(fabricCanvas: Canvas | null) {
  const journalContext = React.useContext(JournalContext);
  const onCanvasObjectModified = async (objectEvent: any) => {
    if (!fabricCanvas) {
      return;
    }
    if (objectEvent.target.type.toLowerCase() === "activeselection") {
      const activeSelection = objectEvent.target as ActiveSelection;
      const updatePromises = [];
      for (const object of activeSelection.getObjects()) {
        const fabricImage = object as FabricImage;
        const updatedSpreadItem = getUpdatedImage(fabricCanvas, fabricImage);
        updatePromises.push(journalContext.updateSpreadItem(updatedSpreadItem));
      }
      await Promise.all(updatePromises);
    } else if (objectEvent.target.type.toLowerCase() === "image") {
      const fabricImage = objectEvent.target as FabricImage;
      const updatedSpreadItem = getUpdatedImage(fabricCanvas, fabricImage);
      await journalContext.updateSpreadItem(updatedSpreadItem);
    } else {
      throw new Error("assertion error -- unknown object type modified");
    }
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
  }, [fabricCanvas, journalContext]);
}

function getUpdatedImage(fabricCanvas: Canvas, fabricImage: FabricImage) {
  const fabricJsMetadata = getFabricImageWithoutSrc(fabricCanvas, fabricImage);
  if (
    !fabricImage.spreadItemId ||
    !fabricImage.spreadId ||
    !fabricImage.imageId
  ) {
    throw new Error("assertion error");
  }
  return {
    id: fabricImage.spreadItemId,
    spreadId: fabricImage.spreadId,
    imageId: fabricImage.imageId,
    fabricjsMetadata: fabricJsMetadata,
  };
}

export default useAutoSaveCanvas;
