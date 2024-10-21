"use client";
import * as React from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

function DragAndDropProvider({ children }: React.PropsWithChildren) {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}
export default DragAndDropProvider;
