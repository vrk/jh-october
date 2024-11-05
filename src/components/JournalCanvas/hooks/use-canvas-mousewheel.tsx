import React from "react";
import { Canvas, FabricObject } from "fabric";
import { useHotkeys } from "react-hotkeys-hook";
import { zoomByDelta, panVerticallyByDelta } from "@/helpers/canvas-helpers";

function useCanvasMousewheel(fabricCanvas: Canvas | null, documentRectangle: FabricObject | undefined) {
  const [isAltKeyPressed, setIsAltKeyPressed] = React.useState(false);
  useHotkeys(
    "meta",
    () => {
      setIsAltKeyPressed(true);
      // console.log("down");
    },
    [isAltKeyPressed],
    {
      keydown: true,
    }
  );
  useHotkeys(
    "meta",
    () => {
      setIsAltKeyPressed(false);
      // console.log("up");
    },
    [isAltKeyPressed],
    {
      keyup: true,
    }
  );

  // Add mousewheel handler
  React.useEffect(() => {
    if (!fabricCanvas || !documentRectangle) {
      return;
    }

    const onMouseWheel = (opt: any) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();
      const deltaX = opt.e.deltaX;
      const deltaY = opt.e.deltaY;
      if (isAltKeyPressed) {
        zoomByDelta(fabricCanvas, deltaY);
      } else {
        panVerticallyByDelta(fabricCanvas, documentRectangle, deltaX, deltaY);
      }
    };
    fabricCanvas.on("mouse:wheel", onMouseWheel);
    return () => {
      fabricCanvas.off("mouse:wheel", onMouseWheel);
    };
  }, [fabricCanvas, isAltKeyPressed, documentRectangle]);
}

export default useCanvasMousewheel;
