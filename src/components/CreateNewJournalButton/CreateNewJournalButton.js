'use client';

import React from 'react';
import Button from "@/components/Button";
import { createNewJournal } from "@/helpers/indexdb";

function CreateNewJournalButton() {
  const onCreateNewJournalClicked = async () => {
    const result = await createNewJournal();
    console.log('new journal created', result);
  };
  return <div>
    <Button onClick={onCreateNewJournalClicked}>New Journal</Button>
  </div>;
}

export default CreateNewJournalButton;
