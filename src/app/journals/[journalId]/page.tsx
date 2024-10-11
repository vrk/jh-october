import styles from "./page.module.css";
import JournalCanvas from "../../../components/JournalCanvas";

export default function JournalPage({
  params,
}: {
  params: { journalId: string };
}) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        Journal Page for {params.journalId}
        <JournalCanvas></JournalCanvas>
      </main>
    </div>
  );
}
