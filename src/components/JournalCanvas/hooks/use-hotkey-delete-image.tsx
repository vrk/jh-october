import React from "react";
import { Canvas } from "fabric";
import { useHotkeys } from "react-hotkeys-hook";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

function useHotkeyDeleteImage(fabricCanvas: Canvas | null) {
  const { currentSpreadItems, setCurrentSpreadItems } = React.useContext(JournalContext);

  useHotkeys(
    "Delete,Backspace",
    () => {
      if (!fabricCanvas) {
        return;
      }
      for (const item of currentSpreadItems) {
        console.log(`-- item ${item.id} has image id:`, item.imageId);
      }

      const activeObjects = fabricCanvas.getActiveObjects();
      const removedSpreadItems: Array<string> = [];
      for (const object of activeObjects) {
        fabricCanvas.remove(object);
        if (object.spreadItemId) {
          console.log("removing spread item ", object.spreadItemId)
          removedSpreadItems.push(object.spreadItemId);
        }
      }
      fabricCanvas.discardActiveObject();
      fabricCanvas.requestRenderAll();
      const newSpreadItems = currentSpreadItems.filter(current => {
        if (removedSpreadItems.includes(current.id)) {
          return false;
        }
        return true;
      });
      for (const item of newSpreadItems) {
        console.log(`-- NEW item ${item.id} has image id:`, item.imageId);
      }
      setCurrentSpreadItems(
        [...newSpreadItems]
      );
    },
    { preventDefault: true },
    [fabricCanvas, currentSpreadItems, setCurrentSpreadItems]
  );
}

export default useHotkeyDeleteImage;
