"use client";
import * as React from 'react';
import style from './NewSpreadButton.module.css';
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

function NewSpreadButton() {
  const journalContext = React.useContext(JournalContext);
  const onClicked = async () => {
    if (!journalContext.journalId) {
      return;
    }
    await journalContext.addSpread();
  }
  return <button className={style.container} onClick={onClicked}>New Spread</button>;
}

export default NewSpreadButton;
