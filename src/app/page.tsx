import styles from "./page.module.css";
import CreateNewJournalButton from "@/components/CreateNewJournalButton";
import JournalList from "@/components/JournalList";

export default function Home() {
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Open Journal:</h1>
        <JournalList></JournalList>
        <hr></hr>
        <CreateNewJournalButton></CreateNewJournalButton>
      </main>
    </div>
  );
}
