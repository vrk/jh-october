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
    currentPrintItems,
    loadedImages,
    allSpreadItems,
    journalLoadedStatus
  } = React.useContext(JournalContext);
  if (!currentPrintPageId || journalLoadedStatus !== JournalLoadedStatus.Loaded) {
    return <></>;
  }
  return (
    <PrintCanvas
      key={currentPrintPageId}
      currentPrintPageId={currentPrintPageId}
      currentPrintItems={currentPrintItems}
      allSpreadItems={allSpreadItems}
      loadedImages={loadedImages}
    ></PrintCanvas>
  );
}

export default PrintSpreadView;
