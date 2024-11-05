import { Canvas, FabricObject } from "fabric";
import { useHotkeys } from "react-hotkeys-hook";
import {
  zoomByDelta,
  panVerticallyByDelta,
  zoomToFitDocument,
} from "@/helpers/canvas-helpers";

function useHotkeyZoom(
  fabricCanvas: Canvas | null,
  documentRectangle: FabricObject | undefined
) {
  useHotkeys(
    "meta+=",
    () => {
      if (!fabricCanvas) {
        return;
      }
      zoomByDelta(fabricCanvas, -100);
    },
    { preventDefault: true },
    [fabricCanvas]
  );
  useHotkeys(
    "meta+minus",
    () => {
      if (!fabricCanvas) {
        return;
      }
      zoomByDelta(fabricCanvas, 100);
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
    },
    { preventDefault: true },
    [fabricCanvas, documentRectangle]
  );
}

export default useHotkeyZoom;
