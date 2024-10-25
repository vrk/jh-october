"use client";
import * as React from "react";
import style from "./SpreadsList.module.css";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";
import SpreadListItem from "../SpreadListItem";

function SpreadsList() {
  const { allSpreads } = React.useContext(JournalContext);

  const [selectedThumbnailId, setSelectedThumbnailId] = React.useState<
    string | null
  >(null);
  return (
    <div className={style.container}>
      {allSpreads.map((spread, index) => (
        <SpreadListItem
          key={spread.id}
          spread={spread}
          isSelected={selectedThumbnailId == spread.id}
          tabIndex={index}
          onBlur={() => setSelectedThumbnailId(null)}
          onFocus={() => setSelectedThumbnailId(spread.id)}
        ></SpreadListItem>
      ))}
    </div>
  );
}

export default SpreadsList;
