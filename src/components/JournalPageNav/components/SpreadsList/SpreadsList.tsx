"use client";
import * as React from "react";
import style from "./SpreadsList.module.css";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";
import SpreadListItem from "../SpreadListItem";

function SpreadsList() {
  const { allSpreads } = React.useContext(JournalContext);
  return (
    <div className={style.container}>
      {allSpreads.map((spread) => (
        <SpreadListItem key={spread.id} spread={spread}></SpreadListItem>
      ))}
    </div>
  );
}

export default SpreadsList;
