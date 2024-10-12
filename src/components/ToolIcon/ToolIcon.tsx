import * as React from "react";
import style from "./ToolIcon.module.css";

type ToolType = "photos";

type ToolIconProps = {
  toolType: "photos";
  onClick: React.MouseEventHandler;
};

function ToolIcon({ toolType, onClick }: React.PropsWithoutRef<ToolIconProps>) {
  return (
    <div
      onClick={onClick}
      className={`${style.container} ${typeToStyle(toolType)}`}
    ></div>
  );
}

function typeToStyle(toolType: ToolType) {
  switch (toolType) {
    case "photos":
      return style.photos;
  }
}

export default ToolIcon;
