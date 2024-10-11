import React from "react";
import { Canvas, FabricImage } from "fabric";
import {
  setCanvasDimensionsToWindowSize,
  setCenterFromObject,
} from "@/helpers/canvas-helpers";

function useCenterOnResize(
  fabricCanvas: Canvas | null,
  overallContainer: React.RefObject<HTMLDivElement>,
  documentRectangle: FabricImage | undefined
) {
  React.useEffect(() => {
    const onWindowResize = () => {
      if (!fabricCanvas || !overallContainer.current || !documentRectangle) {
        return;
      }
      setCanvasDimensionsToWindowSize(fabricCanvas, overallContainer.current);
      setCenterFromObject(fabricCanvas, documentRectangle);
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, [fabricCanvas, overallContainer, documentRectangle]);
}

export default useCenterOnResize;
