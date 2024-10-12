import * as React from 'react';
import style from './ToolbarTray.module.css';
import { Tool } from "@/helpers/tool-defs";
import PhotoTray from '../PhotoTray';

type ToolbarTrayProps = {
  toolType: Tool;
};


function ToolbarTray({ toolType }: React.PropsWithoutRef<ToolbarTrayProps>) {
  function getContents() {
    switch(toolType) {
      case Tool.Photos: 
        return <PhotoTray></PhotoTray>;
    }
  }
  return <div className={style.container}>
    {getContents()}
  </div>;
}

export default ToolbarTray;
