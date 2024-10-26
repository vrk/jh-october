"use client";
import React from "react";
import Button from "@/components/Button";
import { getAllJournals } from "@/helpers/indexdb";
import style from "./journallist.module.css";
import { Journal } from "@/helpers/data-types";

function JournalList() {
  const [journals, setJournals] = React.useState<Array<Journal>>([]);

  React.useEffect(() => {
    getAllJournals().then((journals) => {
      setJournals([...journals]);
    });
  }, []);

  return (
    <div className={style.list}>
      {journals.map((journal) => (
        <Button key={journal.id} href={`/journals/${journal.id}`}>
          Journal {journal.id}
        </Button>
      ))}
    </div>
  );
}

export default JournalList;
