"use client";
import * as React from "react";
import style from "./SpreadsList.module.css";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";
import SpreadListItem from "../SpreadListItem";
import useHotkeyImageNav from "@/hooks/use-hotkey-photo-nav";
import useHotkeyDelete from "@/hooks/use-hotkey-delete-photo-resource";
import { deleteSpread } from "@/helpers/indexdb";

function SpreadsList() {
  const { allSpreads, setCurrentSpreadId, setAllSpreads} = React.useContext(JournalContext);

  const [selectedThumbnailId, setSelectedThumbnailId] = React.useState<
    string | null
  >(null);
  useHotkeyImageNav(allSpreads, selectedThumbnailId, (id: string | null) => {
    setSelectedThumbnailId(id);
    if (id) {
      setCurrentSpreadId(id);
    }
  });

  // TODO: This is very similar code to PhotoTrayThumbnailList - see if can consolidate
  const deleteSelectedSpread = async () => {
    if (!selectedThumbnailId) {
      return;
    }
    const selectedIndex = allSpreads.findIndex(
      (image) => image.id === selectedThumbnailId
    );
    await deleteSpread(selectedThumbnailId);
    const newSpreads = allSpreads.filter((spread) => spread.id !== selectedThumbnailId);
    setAllSpreads(newSpreads);
    if (selectedIndex >= 0) {
      if (selectedIndex < newSpreads.length) {
        setCurrentSpreadId(newSpreads[selectedIndex].id);
      } else if (selectedIndex > 0) {
        // Set to last element in the list
        setCurrentSpreadId(newSpreads[selectedIndex - 1].id);
      }
    }
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
