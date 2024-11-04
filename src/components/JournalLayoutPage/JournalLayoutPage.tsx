import * as React from "react";
import style from "./JournalLayoutPage.module.css";
import JournalPageNav from "../JournalPageNav";
import JournalToolbar from "../JournalToolbar";
import JournalSpreadView from "../JournalSpreadView";
import DragAndDropProvider from "../DragAndDropProvider";

function JournalLayoutPage() {
  return (
    <>
      <DragAndDropProvider>
        <div className={style.inner}>
          <JournalToolbar></JournalToolbar>
          <JournalSpreadView></JournalSpreadView>
        </div>
      </DragAndDropProvider>
      <JournalPageNav></JournalPageNav>
    </>
  );
}

export default JournalLayoutPage;
