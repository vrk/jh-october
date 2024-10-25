import * as React from "react";
import style from "./SpreadListItem.module.css";
import { Spread } from "@/helpers/indexdb";
import Image from "next/image";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";
import hobonichiCousinimage from "@/components/JournalCanvas/images/hobonichi-cousin-spread.png";

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
  const { setCurrentSpreadId } = React.useContext(JournalContext);
  let inner = <></>;
  const onSelectImage = () => {
    setCurrentSpreadId(spread.id);
  };
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
        tabIndex={tabIndex}
        onClick={onSelectImage}
        onFocus={onFocus}
        onBlur={onBlur}
        alt={`preview for page ${spread.order}`}
      ></Image>
    );
  } else {
    inner = (
      <Image
        src={hobonichiCousinimage.src}
        height={hobonichiCousinimage.height}
        width={hobonichiCousinimage.width}
        style={{
          maxHeight: "100%",
          width: "auto",
        }}
        tabIndex={tabIndex}
        onClick={onSelectImage}
        onFocus={onFocus}
        onBlur={onBlur}
        alt={`preview for page ${spread.order}`}
      ></Image>
    );
  }
  const classNames = `${style.container} ${isSelected ? style.selected : ""}`;
  return <div className={classNames}>{inner}</div>;
}

export default SpreadListItem;
