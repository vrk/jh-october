import React from "react";
import { Canvas, FabricObject, TPointerEventInfo } from "fabric";
import { useHotkeys } from "react-hotkeys-hook";
import { enclose } from "@/helpers/canvas-helpers";

function useCanvasPan(
  fabricCanvas: Canvas | null,
  documentRectangle: FabricObject | undefined
) {
  const [isSpacebarPressed, setIsSpacebarPressed] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [lastPosX, setLastPosX] = React.useState(0);
  const [lastPosY, setLastPosY] = React.useState(0);
  useHotkeys(" ", () => {
    if (isSpacebarPressed) {return }
    setIsSpacebarPressed(true);
    // TODO: Figure out why this doesn't work well
    fabricCanvas?.setCursor("grab");
  }, [isSpacebarPressed, fabricCanvas], {
    keydown: true,
    keyup: false,
  });

  useHotkeys(" ", () => {
    setIsSpacebarPressed(false);
    fabricCanvas?.setCursor("default");
  }, [isSpacebarPressed], {
    keyup: true,
    keydown: false,
  });

  React.useEffect(() => {
    if (!fabricCanvas) {
      return;
    }

    const onMouseMove = (opt: any) => {
      if (!fabricCanvas || !documentRectangle) {
        return;
      }
      if (!isDragging) {
        return;
      }

      const { e } = opt;
      const T = fabricCanvas.viewportTransform;
      const { clientX, clientY } = getClientPosition(e);
      T[4] += clientX - lastPosX;
      T[5] += clientY - lastPosY;
      fabricCanvas.requestRenderAll();
      setLastPosX(clientX);
      setLastPosY(clientY);
      // enclose(fabricCanvas, documentRectangle);
    };

    fabricCanvas.on("mouse:move", onMouseMove);
    return () => {
      fabricCanvas.off("mouse:move", onMouseMove);
    };
  }, [fabricCanvas, documentRectangle, isSpacebarPressed, isDragging, lastPosX, lastPosY]);

  React.useEffect(() => {
    if (!fabricCanvas) {
      return;
    }

    const onMouseDown = (opt: TPointerEventInfo) => {
      if (!fabricCanvas) {
        return;
      }
      if (opt.target !== undefined && !isSpacebarPressed) {
        return false;
      }

      fabricCanvas.setCursor("grabbing");

      const { e } = opt;
      const { clientX, clientY } = getClientPosition(e);

      setIsDragging(true);
      setLastPosX(clientX);
      setLastPosY(clientY);
      fabricCanvas.selection = false; // disable selection while grabbing
    };
    fabricCanvas.on("mouse:down", onMouseDown);
    return () => {
      fabricCanvas.off("mouse:down", onMouseDown);
    };
  }, [fabricCanvas, isSpacebarPressed]);

  React.useEffect(() => {
    if (!fabricCanvas) {
      return;
    }

    const onMouseUp = (opt: TPointerEventInfo) => {
      if (!fabricCanvas) {
        return;
      }

      setIsDragging(false);
      fabricCanvas.selection = true; // reenable selection after grab
    };

    fabricCanvas.on("mouse:up", onMouseUp);
    return () => {
      fabricCanvas.off("mouse:up", onMouseUp);
    };
  }, [fabricCanvas]);
}

function getClientPosition(e: any) {
  const positionSource = e.touches ? e.touches[0] : e;
  const { clientX, clientY } = positionSource;
  return {
    clientX,
    clientY,
  };
}

export default useCanvasPan;
