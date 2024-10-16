'use client';

import React from 'react';
import Button from "@/components/Button";
import { createNewJournal } from "@/helpers/indexdb";
import { useRouter } from 'next/navigation';

function CreateNewJournalButton() {
  const router = useRouter();

  const onCreateNewJournalClicked = async () => {
    const result = await createNewJournal();
    router.push(`/journals/${result}`);
  };
  return <div>
    <Button onClick={onCreateNewJournalClicked}>Create New Journal</Button>
  </div>;
}

export default CreateNewJournalButton;
