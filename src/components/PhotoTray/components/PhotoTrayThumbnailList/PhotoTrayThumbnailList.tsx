import * as React from "react";
import style from "./PhotoTrayThumbnailList.module.css";
import PhotoTrayThumbnail from "../PhotoTrayThumbnail/PhotoTrayThumbnail";
import { JournalImage } from "@/helpers/indexdb";

type Props = {
  images: Array<JournalImage>;
};

function PhotoTrayThumbnailList({ images }: React.PropsWithoutRef<Props>) {
  return (
    <div className={style.container}>
      {images.map((image) => (
        <PhotoTrayThumbnail
          src={image.thumbDataUrl}
          key={image.id}
          height={image.thumbHeight}
          width={image.thumbWidth}
          selected={false}
        />
      ))}
    </div>
  );
}

export default PhotoTrayThumbnailList;
