"use client";
import * as React from 'react';
import style from './NewSpreadButton.module.css';
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

function NewSpreadButton() {
  const { journalId, addSpread } = React.useContext(JournalContext);
  const onClicked = async () => {
    if (!journalId) {
      return;
    }
    await addSpread();
  }
  return <button className={style.container} onClick={onClicked}>New Spread</button>;
}

export default NewSpreadButton;
