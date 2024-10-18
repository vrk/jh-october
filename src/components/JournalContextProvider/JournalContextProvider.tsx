"use client";
import React, { createContext, useState } from 'react';

type JournalContextType = [
  string | null,
];

type JournalContextProps = {
  journalId: string
};

export const JournalContext = createContext<JournalContextType>([null]);
const JournalContextProvider = ({ journalId, children }: React.PropsWithChildren<JournalContextProps>) => {

  return (
    <JournalContext.Provider value={[journalId]}>
      {children}
    </JournalContext.Provider>
  );
};

export default JournalContextProvider;
