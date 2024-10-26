import React from "react";
import { Canvas } from "fabric";
import { useHotkeys } from "react-hotkeys-hook";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

function useHotkeyDeleteImage(fabricCanvas: Canvas | null) {
  const journalContext = React.useContext(JournalContext);

  useHotkeys(
    "Delete,Backspace",
    async () => {
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
      await journalContext.deleteSpreadItems(removedSpreadItems);
    },
    { preventDefault: true },
    [fabricCanvas, journalContext]
  );
}

export default useHotkeyDeleteImage;
