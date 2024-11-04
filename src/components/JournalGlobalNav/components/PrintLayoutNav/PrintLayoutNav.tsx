import * as React from "react";
import style from "./PrintLayoutNav.module.css";
import { PageScreen } from "@/app/journals/[journalId]/page";

type Props = {
  setCurrentScreen: (screen: PageScreen) => void;
};

function PrintLayoutNav({ setCurrentScreen }: React.PropsWithoutRef<Props>) {
  return (
    <div className={style.container}>
      <button onClick={() => setCurrentScreen(PageScreen.JournalScreen)}>
        Back to journal
      </button>
    </div>
  );
}

export default PrintLayoutNav;
