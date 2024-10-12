import styles from "./journalid.module.css";
import JournalCanvas from "../../../components/JournalCanvas";
import JournalGlobalNav from "@/components/JournalGlobalNav/JournalGlobalNav";
import JournalToolbar from "@/components/JournalToolbar/JournalToolbar";
import JournalPageNav from "@/components/JournalPageNav/JournalPageNav";

export default function JournalPage({
  params,
}: {
  params: { journalId: string };
}) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <JournalGlobalNav></JournalGlobalNav>
        <div className={styles.inner}>
          <JournalToolbar></JournalToolbar>
          <JournalCanvas></JournalCanvas>
        </div>
        <JournalPageNav></JournalPageNav>
      </main>
    </div>
  );
}
