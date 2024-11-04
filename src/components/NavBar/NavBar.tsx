import * as React from 'react';
import style from './NavBar.module.css';

function NavBar({ children }: React.PropsWithChildren) {
  return <div className={style.container}>{children}</div>;
}

export default NavBar;
