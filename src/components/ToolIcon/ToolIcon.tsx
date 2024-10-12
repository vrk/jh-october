import * as React from 'react';
import style from './ToolIcon.module.css';

type ToolIconProps = {
  onClick: React.MouseEventHandler
};

function ToolIcon({ onClick }: React.PropsWithoutRef<ToolIconProps>) {
  return <div onClick={onClick} className={style.container}></div>;
}

export default ToolIcon;
