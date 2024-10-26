"use client";
import * as React from "react";
import style from "./SpreadsList.module.css";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";
import SpreadListItem from "../SpreadListItem";
import useHotkeyImageNav from "@/hooks/use-hotkey-photo-nav";
import useHotkeyDelete from "@/hooks/use-hotkey-delete-photo-resource";

function SpreadsList() {
  const journalContext = React.useContext(JournalContext);

  const [selectedThumbnailId, setSelectedThumbnailId] = React.useState<
    string | null
  >(null);
  useHotkeyImageNav(journalContext.allSpreads, selectedThumbnailId, (id: string | null) => {
    setSelectedThumbnailId(id);
    if (id) {
      journalContext.setCurrentSpreadId(id);
    }
  }, [journalContext]);

  const deleteSelectedSpread = async () => {
    if (!selectedThumbnailId) {
      return;
    }

    // don't delete the last spread
    if (journalContext.allSpreads.length === 1){
      return;
    }
    await journalContext.deleteSpread(selectedThumbnailId);
    setSelectedThumbnailId(null);
  };
  useHotkeyDelete(selectedThumbnailId, () => deleteSelectedSpread(), [journalContext]);
  return (
    <div className={style.container}>
      {journalContext.allSpreads.map((spread, index) => (
        <SpreadListItem
          key={spread.id}
          spread={spread}
          isSelected={selectedThumbnailId == spread.id}
          tabIndex={index}
          onBlur={() => setSelectedThumbnailId(null)}
          onFocus={() => {
            journalContext.setCurrentSpreadId(spread.id);
            setSelectedThumbnailId(spread.id);
          }}
        ></SpreadListItem>
      ))}
    </div>
  );
}

export default SpreadsList;
