import styles from "./page.module.css";
import CreateNewJournalButton from "@/components/CreateNewJournalButton";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <CreateNewJournalButton></CreateNewJournalButton>
      </main>
    </div>
  );
}
