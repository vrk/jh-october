import React from "react";
import { Canvas } from "fabric";
import { useHotkeys } from "react-hotkeys-hook";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

function useHotkeyDeleteImage(fabricCanvas: Canvas | null) {
  const { currentSpreadItems, setCurrentSpreadItems } =
    React.useContext(JournalContext);
  useHotkeys(
    "Delete,Backspace",
    () => {
      if (!fabricCanvas) {
        return;
      }
      const activeObjects = fabricCanvas.getActiveObjects();
      const removedSpreadItems: Array<string> = [];
      for (const object of activeObjects) {
        fabricCanvas.remove(object);
        if (object.spreadId) {
          removedSpreadItems.push(object.spreadId);
        }
      }
      fabricCanvas.discardActiveObject();
      fabricCanvas.requestRenderAll();
      console.log("delete");
      setCurrentSpreadItems(
        currentSpreadItems.filter(
          (item) => !removedSpreadItems.includes(item.id)
        )
      );
    },
    { preventDefault: true },
    [fabricCanvas]
  );
}

export default useHotkeyDeleteImage;
