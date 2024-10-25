"use client";
import * as React from "react";
import style from "./SpreadsList.module.css";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

function SpreadsList() {
  const {
    journalId,
    loadedImages,
    setLoadedImages,
    currentSpreadId,
    currentSpreadItems,
  } = React.useContext(JournalContext);
  return <div className={style.container}></div>;
}

export default SpreadsList;
