import * as React from "react";
import style from "./JournalLayoutNav.module.css";
import { PageScreen } from "@/app/journals/[journalId]/page";

type Props = {
  setCurrentScreen: (screen: PageScreen) => void;
};
function JournalLayoutNav({ setCurrentScreen }: React.PropsWithoutRef<Props>) {
  return (
    <div className={style.container}>
      <button onClick={() => setCurrentScreen(PageScreen.PrintScreen)}>
        Ready to print
      </button>
    </div>
  );
}

export default JournalLayoutNav;
