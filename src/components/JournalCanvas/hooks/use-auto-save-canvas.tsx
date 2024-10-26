"use client";
import React from "react";
import { Canvas, FabricImage } from "fabric";
import { getFabricImageWithoutSrc } from "@/helpers/canvas-helpers";
import { SpreadItem, updateSpreadItem } from "@/helpers/indexdb";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

const AUTO_SAVE_DELAY_MS = 500;

function useAutoSaveCanvas(fabricCanvas: Canvas | null) {
  const { updateSpreadItem } =
    React.useContext(JournalContext);
  const onCanvasObjectModified = async (objectEvent: any) => {
    if (!fabricCanvas) {
      return;
    }
    const fabricImage = objectEvent.target as FabricImage;
    console.log("object is modified");
    const fabricJsMetadata = getFabricImageWithoutSrc(
      fabricCanvas,
      fabricImage
    );
    if (
      !fabricImage.spreadItemId ||
      !fabricImage.spreadId ||
      !fabricImage.imageId
    ) {
      throw new Error("assertion error");
    }
    const updatedSpreadItem = {
      id: fabricImage.spreadItemId,
      spreadId: fabricImage.spreadId,
      imageId: fabricImage.imageId,
      fabricjsMetadata: fabricJsMetadata,
    };
    await updateSpreadItem(updatedSpreadItem);
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
