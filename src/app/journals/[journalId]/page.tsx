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
        <JournalCanvas></JournalCanvas>
      </main>
    </div>
  );
}
