"use client"
import * as React from "react";
import {
  JournalContext,
  JournalLoadedStatus,
} from "../JournalContextProvider/JournalContextProvider";
import PrintCanvas from "../PrintCanvas";

function PrintSpreadView() {
  const {
    currentPrintPageId,
    loadedImages,
    allSpreadItems,
    journalLoadedStatus
  } = React.useContext(JournalContext);
  if (journalLoadedStatus !== JournalLoadedStatus.Loaded) {
    return <></>;
  }
  return (
    <PrintCanvas
      key={currentPrintPageId}
      allSpreadItems={allSpreadItems}
      loadedImages={loadedImages}
    ></PrintCanvas>
  );
}

export default PrintSpreadView;
