import { Canvas } from "fabric";
import { useHotkeys } from "react-hotkeys-hook";

function useHotkeyDeleteImage(fabricCanvas: Canvas | null) {
  useHotkeys(
    "Delete,Backspace",
    () => {
      if (!fabricCanvas) {
        return;
      }
      const activeObjects = fabricCanvas.getActiveObjects();
      // TODO: Kind of a hack to prevent deletions when editing the sidebar settings
      if (
        activeObjects.length === 0 ||
        document.activeElement?.nodeName === "INPUT"
      ) {
        return;
      }
      for (const object of activeObjects) {
        fabricCanvas.remove(object);
      }
      fabricCanvas.discardActiveObject();
      fabricCanvas.requestRenderAll();
      console.log("delete");
    },
    { preventDefault: true },
    [fabricCanvas]
  );
}

export default useHotkeyDeleteImage;
