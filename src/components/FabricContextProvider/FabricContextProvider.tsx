"use client";
import { Canvas, Rect } from 'fabric';
import React, { createContext, useState } from 'react';

// Here are the things that can live in the fabric context.
type FabContext = [
  // The canvas
  Canvas | null,
  // The setter for the canvas
  (c: Canvas) => void
];

// This is the context that components in need of canvas-access will use:
export const FabricContext = createContext<FabContext>([null, () => {}]);

/**
 * This context provider will be rendered as a wrapper component and will give the
 * canvas context to all of its children.
 */
const FabricContextProvider = ({ children }: React.PropsWithChildren) => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const initCanvas = (c: Canvas): void => {
    setCanvas(c);
  };

  return (
    <FabricContext.Provider value={[canvas, initCanvas]}>
      {children}
    </FabricContext.Provider>
  );
};

export default FabricContextProvider;
