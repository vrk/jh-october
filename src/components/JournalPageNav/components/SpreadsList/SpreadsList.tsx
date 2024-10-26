"use client";
import * as React from "react";
import style from "./SpreadsList.module.css";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";
import SpreadListItem from "../SpreadListItem";
import useHotkeyImageNav from "@/hooks/use-hotkey-photo-nav";
import useHotkeyDelete from "@/hooks/use-hotkey-delete-photo-resource";

function SpreadsList() {
  const { allSpreads, setCurrentSpreadId, deleteSpread } = React.useContext(JournalContext);

  const [selectedThumbnailId, setSelectedThumbnailId] = React.useState<
    string | null
  >(null);
  useHotkeyImageNav(allSpreads, selectedThumbnailId, (id: string | null) => {
    setSelectedThumbnailId(id);
    if (id) {
      setCurrentSpreadId(id);
    }
  });

  const deleteSelectedSpread = async () => {
    if (!selectedThumbnailId) {
      return;
    }
    await deleteSpread(selectedThumbnailId);
    setSelectedThumbnailId(null);
  };
  useHotkeyDelete(selectedThumbnailId, () => deleteSelectedSpread());
  return (
    <div className={style.container}>
      {allSpreads.map((spread, index) => (
        <SpreadListItem
          key={spread.id}
          spread={spread}
          isSelected={selectedThumbnailId == spread.id}
          tabIndex={index}
          onBlur={() => setSelectedThumbnailId(null)}
          onFocus={() => {
            setCurrentSpreadId(spread.id);
            setSelectedThumbnailId(spread.id);
          }}
        ></SpreadListItem>
      ))}
    </div>
  );
}

export default SpreadsList;
