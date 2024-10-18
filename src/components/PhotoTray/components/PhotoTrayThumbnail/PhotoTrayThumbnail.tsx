import * as React from "react";
import style from "./PhotoTrayThumbnail.module.css";
import Image from "next/image";

type PhotoTrayThumbnailProps = {
  src: string;
  height: number;
  width: number;
  selected: boolean;
};

function PhotoTrayThumbnail({
  src,
  height,
  width,
  selected = false
}: React.PropsWithoutRef<PhotoTrayThumbnailProps>) {
  const classNames = `${style.container} ${selected ? style.selected : ''}`; 
  return (
    <div className={classNames}>
      <Image
        src={src}
        alt="photo thumbnail"
        height={height}
        width={width}
        style={{
          width: "100%",
          height: "auto",
        }}
      />
    </div>
  );
}

export default PhotoTrayThumbnail;
