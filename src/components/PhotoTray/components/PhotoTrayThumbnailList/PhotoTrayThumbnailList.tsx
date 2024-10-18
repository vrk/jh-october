import * as React from "react";
import style from "./PhotoTrayThumbnailList.module.css";
import PhotoTrayThumbnail from "../PhotoTrayThumbnail/PhotoTrayThumbnail";
import { JournalImage } from "@/helpers/indexdb";

type Props = {
  images: Array<JournalImage>;
};

function PhotoTrayThumbnailList({ images }: React.PropsWithoutRef<Props>) {
  const [selectedId, setSelectedId] = React.useState<string|null>(null); 
  return (
    <div className={style.container}>
      {images.map((image, index) => (
        <PhotoTrayThumbnail
          src={image.thumbDataUrl}
          key={image.id}
          height={image.thumbHeight}
          width={image.thumbWidth}
          tabIndex={index}
          selected={selectedId === image.id}
          onBlur={() => setSelectedId(null)}
          onFocus={() => setSelectedId(image.id)}
        />
      ))}
    </div>
  );
}

export default PhotoTrayThumbnailList;
