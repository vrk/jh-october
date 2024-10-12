import { Canvas, FabricImage } from "fabric";
import { useHotkeys } from "react-hotkeys-hook";
import {
  zoomByDelta,
  panVerticallyByDelta,
  zoomToFitDocument,
} from "@/helpers/canvas-helpers";

function useHotkeyZoom(
  fabricCanvas: Canvas | null,
  documentRectangle: FabricImage | undefined
) {
  useHotkeys(
    "meta+=",
    () => {
      if (!fabricCanvas) {
        return;
      }
      zoomByDelta(fabricCanvas, -100);
      console.log("zoom in");
    },
    { preventDefault: true },
    [fabricCanvas]
  );
  useHotkeys(
    "meta+minus",
    () => {
      console.log("zoom out before");
      if (!fabricCanvas) {
        return;
      }
      zoomByDelta(fabricCanvas, 100);
      console.log("zoom out");
    },
    { preventDefault: true },
    [fabricCanvas]
  );
  useHotkeys(
    "meta+0",
    () => {
      if (!fabricCanvas || !documentRectangle) {
        return;
      }
      zoomToFitDocument(fabricCanvas, documentRectangle);
      console.log("zoom reset");
    },
    { preventDefault: true },
    [fabricCanvas, documentRectangle]
  );
}

export default useHotkeyZoom;
