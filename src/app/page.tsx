import styles from "./page.module.css";
import CreateNewJournalButton from "@/components/CreateNewJournalButton";
import JournalList from "@/components/JournalList";

export default function Home() {
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <JournalList></JournalList>
        <CreateNewJournalButton></CreateNewJournalButton>
      </main>
    </div>
  );
}
