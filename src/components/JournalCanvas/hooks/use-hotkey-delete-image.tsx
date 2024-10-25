import React from "react";
import { Canvas } from "fabric";
import { useHotkeys } from "react-hotkeys-hook";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";
import { deleteSpreadItem } from "@/helpers/indexdb";

function useHotkeyDeleteImage(fabricCanvas: Canvas | null) {
  const { currentSpreadItems, setCurrentSpreadItems } = React.useContext(JournalContext);

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
        if (object.spreadItemId) {
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

      setCurrentSpreadItems(
        [...newSpreadItems]
      );

      removedSpreadItems.forEach(spreadItemId => deleteSpreadItem(spreadItemId));

    },
    { preventDefault: true },
    [fabricCanvas, currentSpreadItems, setCurrentSpreadItems]
  );
}

export default useHotkeyDeleteImage;
