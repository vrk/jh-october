"use client";
import * as React from "react";
import styles from "./journalid.module.css";
import JournalGlobalNav from "@/components/JournalGlobalNav/JournalGlobalNav";
import JournalContextProvider from "@/components/JournalContextProvider/JournalContextProvider";
import JournalLayoutPage from "@/components/JournalLayoutPage";

export enum PageScreen {
  JournalScreen,
  PrintScreen,
}

export default function JournalPage({
  params,
}: {
  params: { journalId: string };
}) {
  const [currentScreen, setCurrentScreen] = React.useState(
    PageScreen.JournalScreen
  );
  const module = getScreenModule(currentScreen);
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <JournalContextProvider journalId={params.journalId}>
          <JournalGlobalNav
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
          ></JournalGlobalNav>
          {module}
        </JournalContextProvider>
      </main>
    </div>
  );
}

function getScreenModule(screen: PageScreen) {
  switch (screen) {
    case PageScreen.JournalScreen:
      return <JournalLayoutPage></JournalLayoutPage>;
    case PageScreen.PrintScreen:
      return <JournalLayoutPage></JournalLayoutPage>;
  }
}
