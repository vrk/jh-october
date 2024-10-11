import React from 'react';
import { Canvas } from 'fabric';
import { useHotkeys } from "react-hotkeys-hook";
import {
  zoomByDelta,
  panVerticallyByDelta,
} from "@/helpers/canvas-helpers";

function useCanvasMousewheel(fabricCanvas: Canvas| null) {
  const [isAltKeyPressed, setIsAltKeyPressed] = React.useState(false);
  useHotkeys("meta", () => setIsAltKeyPressed(true), [isAltKeyPressed], {
    keydown: true,
  });
  useHotkeys("meta", () => setIsAltKeyPressed(false), [isAltKeyPressed], {
    keyup: true,
  });

  // Add mousewheel handler
  React.useEffect(() => {
    if (!fabricCanvas) {
      return;
    }

    const onMouseWheel = (opt: any) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();
      const delta = opt.e.deltaY;
      if (isAltKeyPressed) {
        zoomByDelta(fabricCanvas, delta);
      } else {
        panVerticallyByDelta(fabricCanvas, delta);
      }
    };
    fabricCanvas.on("mouse:wheel", onMouseWheel);
    return () => {
      fabricCanvas.off("mouse:wheel", onMouseWheel);
    };
  }, [fabricCanvas, isAltKeyPressed]);
}

export default useCanvasMousewheel;