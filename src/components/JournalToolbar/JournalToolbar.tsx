"use client";
import * as React from 'react';
import style from './JournalToolbar.module.css';
import ToolIcon from '../ToolIcon';

enum Tool {
  Photos
}

function JournalToolbar() {
  const [ selectedTool, setSelectedTool ] = React.useState(Tool.Photos);
  const [ isToolbarOpen, setIsToolbarOpen ] = React.useState(false);

  const toolbarMain = 
    <div className={style.toolbarMain}></div>
  ;

  return <div className={style.container}>
    <div className={style.toolicons} onClick={() => setIsToolbarOpen(!isToolbarOpen)}>
      <ToolIcon toolType="photos" onClick={() => setSelectedTool(Tool.Photos)}></ToolIcon>
    </div>`
    {isToolbarOpen && toolbarMain}
  </div>;
}

export default JournalToolbar;
