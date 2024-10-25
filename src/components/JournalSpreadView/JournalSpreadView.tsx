"use client"
import * as React from "react";
import {
  JournalContext,
  JournalLoadedStatus,
} from "../JournalContextProvider/JournalContextProvider";
import JournalCanvas from "../JournalCanvas";

function JournalSpreadView() {
  const {
    currentSpreadId,
    journalLoadedStatus,
    currentSpreadItems,
    loadedImages,
  } = React.useContext(JournalContext);
  if (!currentSpreadId || journalLoadedStatus !== JournalLoadedStatus.Loaded) {
    return <></>;
  }
  return (
    <JournalCanvas
      key={currentSpreadId}
      currentSpreadId={currentSpreadId}
      currentSpreadItems={currentSpreadItems}
      loadedImages={loadedImages}
    ></JournalCanvas>
  );
}

export default JournalSpreadView;
