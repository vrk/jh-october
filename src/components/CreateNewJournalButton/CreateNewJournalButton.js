'use client';

import React from 'react';
import Button from "@/components/Button";

function CreateNewJournalButton() {
  const onCreateNewJournalClicked = () => {
    console.log('new journal');
  };
  return <div>
    <Button onClick={onCreateNewJournalClicked}>New Journal</Button>
  </div>;
}

export default CreateNewJournalButton;
