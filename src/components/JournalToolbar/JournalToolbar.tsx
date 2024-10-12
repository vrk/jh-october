"use client";
import * as React from 'react';
import style from './JournalToolbar.module.css';
import ToolIcon from '../ToolIcon';
import { Tool } from "@/helpers/tool-defs";
import ToolbarTray from '../ToolbarTray';

function JournalToolbar() {
  const [ selectedTool, setSelectedTool ] = React.useState(Tool.Photos);
  const [ isToolbarOpen, setIsToolbarOpen ] = React.useState(false);

  return <div className={style.container}>
    <div className={style.toolicons} onClick={() => setIsToolbarOpen(!isToolbarOpen)}>
      <ToolIcon toolType="photos" onClick={() => setSelectedTool(Tool.Photos)}></ToolIcon>
    </div>`
    {isToolbarOpen && <ToolbarTray toolType={selectedTool}></ToolbarTray>}
  </div>;
}

export default JournalToolbar;
