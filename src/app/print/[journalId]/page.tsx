import * as React from "react";
import styles from "./print.module.css";
import JournalContextProvider from "@/components/JournalContextProvider/JournalContextProvider";
import PrintCanvas from "@/components/PrintCanvas";
import PrintLayoutNav from "@/components/PrintLayoutNav";

export default function PrintPage({
  params,
}: {
  params: { journalId: string };
}) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <JournalContextProvider journalId={params.journalId}>
          <PrintLayoutNav journalId={params.journalId}></PrintLayoutNav>
          <div className={styles.inner}>
            <PrintCanvas></PrintCanvas>
          </div>
        </JournalContextProvider>
      </main>
    </div>
  );
}
