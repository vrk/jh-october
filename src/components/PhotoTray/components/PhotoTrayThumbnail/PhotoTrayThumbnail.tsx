import * as React from "react";
import style from "./PhotoTrayThumbnail.module.css";
import Image from "next/image";
import useIsVisible from "@/hooks/use-is-visible";

type PhotoTrayThumbnailProps = {
  src: string;
  height: number;
  width: number;
  selected: boolean;
  tabIndex: number;
  onFocus?: () => void;
  onBlur?: () => void;
};

function PhotoTrayThumbnail({
  src,
  height,
  width,
  onFocus,
  onBlur,
  tabIndex,
  selected = false
}: React.PropsWithoutRef<PhotoTrayThumbnailProps>) {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const isVisible = useIsVisible(imageRef);

  React.useEffect(() => {
    if (!selected) {
      imageRef.current?.blur();
    } else {
      imageRef.current?.focus();
      if (!isVisible) {
        imageRef.current?.scrollIntoView();
      }
    }
  }, [selected, imageRef]);

  const classNames = `${style.container} ${selected ? style.selected : ''}`; 
  return (
    <div className={classNames}>
      <Image
        ref={imageRef}
        src={src}
        alt="photo thumbnail"
        height={height}
        width={width}
        style={{
          width: "100%",
          height: "auto",
        }}
        tabIndex={tabIndex}
        onFocus={onFocus}
        onBlur={() => { console.log('blur item'); onBlur && onBlur() }}
      />
    </div>
  );
}

export default PhotoTrayThumbnail;
