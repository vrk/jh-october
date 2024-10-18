import * as React from "react";
import style from "./PhotoTrayThumbnail.module.css";
import Image from 'next/image';

type PhotoTrayThumbnailProps = {
  src: string;
  height: number;
  width: number;
};

function PhotoTrayThumbnail({
  src,
}: React.PropsWithoutRef<PhotoTrayThumbnailProps>) {
  return <div className={style.container}>
    <Image src={src} alt="photo thumbnail" height={}/>
  </div>;
}

export default PhotoTrayThumbnail;
 