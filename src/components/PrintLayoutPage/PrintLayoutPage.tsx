import * as React from "react";
import style from "./PrintLayoutPage.module.css";
import PrintCanvas from "../PrintCanvas";

function PrintLayoutPage() {
  return (
    <>
      <div className={style.inner}>
        <PrintCanvas></PrintCanvas>
      </div>
    </>
  );
}

export default PrintLayoutPage;
