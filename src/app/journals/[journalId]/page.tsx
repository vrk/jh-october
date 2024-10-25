import styles from "./journalid.module.css";
import JournalCanvas from "../../../components/JournalCanvas";
import JournalGlobalNav from "@/components/JournalGlobalNav/JournalGlobalNav";
import JournalToolbar from "@/components/JournalToolbar/JournalToolbar";
import JournalPageNav from "@/components/JournalPageNav/JournalPageNav";
import JournalContextProvider from "@/components/JournalContextProvider/JournalContextProvider";
import DragAndDropProvider from "@/components/DragAndDropProvider";
import JournalSpreadView from "@/components/JournalSpreadView";

export default function JournalPage({
  params,
}: {
  params: { journalId: string };
}) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <JournalContextProvider journalId={params.journalId}>
          <JournalGlobalNav></JournalGlobalNav>
          <DragAndDropProvider>
            <div className={styles.inner}>
              <JournalToolbar></JournalToolbar>
              <JournalSpreadView></JournalSpreadView>
            </div>
          </DragAndDropProvider>
          <JournalPageNav></JournalPageNav>
        </JournalContextProvider>
      </main>
    </div>
  );
}
