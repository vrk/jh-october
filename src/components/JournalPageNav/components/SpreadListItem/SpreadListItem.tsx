import * as React from "react";
import style from "./SpreadListItem.module.css";
import Image from "next/image";
import hobonichiCousinimage from "@/components/JournalCanvas/images/hobonichi-cousin-spread.png";
import { Spread } from "@/helpers/data-types";

type Props = {
  spread: Spread;
  isSelected: boolean;
  tabIndex: number;
  onFocus?: () => void;
  onBlur?: () => void;
};

function SpreadListItem({
  spread,
  isSelected,
  tabIndex,
  onFocus,
  onBlur,
}: React.PropsWithRef<Props>) {
  const classNames = `${style.container} ${isSelected ? style.selected : ""}`;
  return (
    <div className={classNames}>
      <Image
        src={hobonichiCousinimage.src}
        height={hobonichiCousinimage.height}
        width={hobonichiCousinimage.width}
        style={{
          maxHeight: "100%",
          width: "auto",
        }}
        tabIndex={tabIndex}
        onFocus={onFocus}
        onBlur={onBlur}
        alt={`preview for page ${spread.order}`}
      ></Image>
    </div>
  );
}

export default SpreadListItem;
