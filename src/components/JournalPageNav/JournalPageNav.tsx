import * as React from 'react';
import style from './JournalPageNav.module.css';
import SpreadsList from './components/SpreadsList';

function JournalPageNav() {
  return <div className={style.container}>
    <SpreadsList></SpreadsList>
  </div>;
}

export default JournalPageNav;
