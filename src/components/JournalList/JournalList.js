'use client'
import React from 'react';
import Button from "@/components/Button";
import { getAllJournals } from "@/helpers/indexdb";

function JournalList() {
  const [ journals, setJournals ] = React.useState([]);

  React.useEffect(() => {
    getAllJournals().then((journals) => {
      console.log('all journals are', journals)
      setJournals([...journals]);
    });
  }, []);

  console.log("RENDER", journals);

  return <div>
    {journals.map(journal =>
        <Button key={journal.key} href={`/journals/${journal.id}`}>Journal {journal.id}</Button>
    )}
  </div>;
}

export default JournalList;
