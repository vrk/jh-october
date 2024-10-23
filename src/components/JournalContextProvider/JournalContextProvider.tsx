"use client";
import {
  getAllSpreadItemIdsForSpread,
  getAllSpreadsForJournal,
  Spread,
  SpreadItem,
} from "@/helpers/indexdb";
import React from "react";

type JournalContextType = {
  journalId: string | null;
  currentSpreadId: string | null;
  allSpreads: Array<Spread>;
  currentSpreadItems: Array<SpreadItem>;
  setCurrentSpreadId: (currentSpreadId: string) => void;
  setAllSpreads: (allSpreads: Array<Spread>) => void;
  setCurrentSpreadItems: (currentSpreadItemIds: Array<SpreadItem>) => void;
};

type JournalContextProps = {
  journalId: string;
};

export const JournalContext = React.createContext<JournalContextType>({
  journalId: null,
  currentSpreadId: null,
  allSpreads: [],
  currentSpreadItems: [],
  setCurrentSpreadId: () => {},
  setAllSpreads: () => {},
  setCurrentSpreadItems: () => {},
});
const JournalContextProvider = ({
  journalId,
  children,
}: React.PropsWithChildren<JournalContextProps>) => {
  const [allSpreads, setAllSpreads] = React.useState<Array<Spread>>([]);
  const [currentSpreadId, setCurrentSpreadId] = React.useState<string | null>(
    null
  );
  const [currentSpreadItems, setCurrentSpreadItems] = React.useState<
    Array<SpreadItem>
  >([]);

  React.useEffect(() => {
    getAllSpreadsForJournal(journalId).then((spreads) => {
      setAllSpreads(spreads);
      if (spreads.length >= 1) {
        setCurrentSpreadId(spreads[0].id);
      }
    });
  }, [setAllSpreads, setCurrentSpreadId]);

  React.useEffect(() => {
    if (!currentSpreadId) {
      return;
    }
    getAllSpreadItemIdsForSpread(currentSpreadId).then((spreadItems) => {
      setCurrentSpreadItems(spreadItems);
    });
  }, [currentSpreadId, setCurrentSpreadItems]);

  return (
    <JournalContext.Provider
      value={{
        journalId,
        currentSpreadId,
        setCurrentSpreadId,
        allSpreads,
        setAllSpreads,
        currentSpreadItems,
        setCurrentSpreadItems
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export default JournalContextProvider;
