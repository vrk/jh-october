import * as React from 'react';
import style from './JournalPageNav.module.css';
import SpreadsList from './components/SpreadsList';
import NewSpreadButton from './components/NewSpreadButton';

function JournalPageNav() {
  return <div className={style.container}>
    <NewSpreadButton></NewSpreadButton>
    <SpreadsList></SpreadsList>
  </div>;
}

export default JournalPageNav;
