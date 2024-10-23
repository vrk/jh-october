'use client';

import React from 'react';
import Button from "@/components/Button";
import { createJournal } from "@/helpers/indexdb";
import { useRouter } from 'next/navigation';

function CreateNewJournalButton() {
  const router = useRouter();

  const onCreateNewJournalClicked = async () => {
    const { journal } = await createJournal();
    // TODO: Maybe also pass along spread info? possibly do a refactor
    router.push(`/journals/${journal.id}`);
  };
  return <div>
    <Button onClick={onCreateNewJournalClicked}>Create New Journal</Button>
  </div>;
}

export default CreateNewJournalButton;
