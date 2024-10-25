import * as React from "react";
import style from "./SpreadListItem.module.css";
import { Spread } from "@/helpers/indexdb";
import Image from "next/image";

type Props = {
  spread: Spread;
};

function SpreadListItem({ spread }: React.PropsWithRef<Props>) {
  let inner = <></>;
  if (
    spread.previewThumbHeight &&
    spread.previewThumbUrl &&
    spread.previewThumbWidth
  ) {
    inner = (
      <Image
        src={spread.previewThumbUrl}
        height={spread.previewThumbHeight}
        width={spread.previewThumbWidth}
        style={{
          maxHeight: "100%",
          width: "auto",
        }}
        alt={`preview for page ${spread.order}`}
      ></Image>
    );
  }
  return <div className={style.container}>{inner}</div>;
}

export default SpreadListItem;
