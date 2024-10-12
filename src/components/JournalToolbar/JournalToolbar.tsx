import * as React from 'react';
import style from './JournalToolbar.module.css';

function JournalToolbar() {
  return <div className={style.container}>
    <div className={style.toolicons}></div>
    <div className={style.toolbarMain}></div>

  </div>;
}

export default JournalToolbar;
