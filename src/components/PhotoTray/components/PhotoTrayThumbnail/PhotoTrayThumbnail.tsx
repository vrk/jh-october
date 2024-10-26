import * as React from "react";
import style from "./PhotoTrayThumbnail.module.css";
import Image from "next/image";
import useIsVisible from "@/hooks/use-is-visible";
import { useDrag } from "react-dnd";
import {
  THUMBNAIL_DRAG_ACCEPT_TYPE,
  ThumbnailDragParameteters,
} from "@/helpers/drag-and-drop-helpers";
import { JournalImage } from "@/helpers/data-types";

type PhotoTrayThumbnailProps = {
  image: JournalImage;
  selected: boolean;
  tabIndex: number;
  onFocus?: () => void;
  onBlur?: () => void;
};

function PhotoTrayThumbnail({
  image,
  onFocus,
  onBlur,
  tabIndex,
  selected = false,
}: React.PropsWithRef<PhotoTrayThumbnailProps>) {
  const dragParameter: ThumbnailDragParameteters = { id: image.id };
  const [_, drag] = useDrag(() => ({
    type: THUMBNAIL_DRAG_ACCEPT_TYPE,
    item: dragParameter,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

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
  const displayDate = image.photoTakenTime || image.lastModified;

  const classNames = `${style.container} ${selected ? style.selected : ""}`;
  return (
    <div role="Handle" ref={drag as any} className={classNames}>
      <Image
        ref={imageRef}
        src={image.thumbDataUrl}
        alt="photo thumbnail"
        height={image.thumbHeight}
        width={image.thumbWidth}
        style={{
          width: "100%",
          height: "auto",
        }}
        tabIndex={tabIndex}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <div>{new Date(displayDate).toLocaleString()}</div>
    </div>
  );
}

export default PhotoTrayThumbnail;
