"use client";
import * as React from 'react';
import style from './NewSpreadButton.module.css';
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";
import { createSpread } from '@/helpers/indexdb';

function NewSpreadButton() {
  const { journalId, allSpreads, setAllSpreads, setCurrentSpreadId } = React.useContext(JournalContext);
  const onClicked = async () => {
    if (!journalId) {
      return;
    }
    const newSpread = await createSpread(journalId);
    setAllSpreads([...allSpreads, newSpread]);
    setCurrentSpreadId(newSpread.id);
  }
  return <button className={style.container} onClick={onClicked}>New Spread</button>;
}

export default NewSpreadButton;
