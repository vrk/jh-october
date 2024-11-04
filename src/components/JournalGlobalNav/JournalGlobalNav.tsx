import React from "react";
import style from "./journalglobalnav.module.css";
import { PageScreen } from "@/app/journals/[journalId]/page";
import JournalLayoutNav from "./components/JournalLayoutNav";
import PrintLayoutNav from "./components/PrintLayoutNav";

type Props = {
  currentScreen: PageScreen;
  setCurrentScreen: (screen: PageScreen) => void;
};

function JournalGlobalNav({
  currentScreen,
  setCurrentScreen,
}: React.PropsWithoutRef<Props>) {
  const module = getScreenModule(currentScreen, setCurrentScreen);
  return <div className={style.container}>{module}</div>;
}

function getScreenModule(
  screen: PageScreen,
  setCurrentScreen: (screen: PageScreen) => void
) {
  switch (screen) {
    case PageScreen.JournalScreen:
      return <JournalLayoutNav setCurrentScreen={setCurrentScreen}></JournalLayoutNav>;
    case PageScreen.PrintScreen:
      return <PrintLayoutNav setCurrentScreen={setCurrentScreen}></PrintLayoutNav>;
  }
}

export default JournalGlobalNav;
