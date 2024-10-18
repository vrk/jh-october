import * as React from "react";
import style from "./PhotoTrayThumbnailList.module.css";
import PhotoTrayThumbnail from "../PhotoTrayThumbnail/PhotoTrayThumbnail";
import { JournalImage } from "@/helpers/indexdb";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import useHotkeyDeletePhotoResource from "../../hooks/use-hotkey-delete-photo-resource";

type Props = {
  images: Array<JournalImage>;
};

function PhotoTrayThumbnailList({ images }: React.PropsWithoutRef<Props>) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);
  useHotkeyDeletePhotoResource(selectedId, () => setIsConfirmationOpen(true));

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
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        title={"Do you want to delete this image?"}
        description={"This can't be undone"}
        cancel={"Cancel"}
        confirm={"Yes, delete"}
        onOpenChange={(isOpen) => {
          setIsConfirmationOpen(isOpen);
        }}
        onConfirm={() => {
          console.log('delete');
          setIsConfirmationOpen(false);
        }}
      ></ConfirmationDialog>
    </div>
  );
}

export default PhotoTrayThumbnailList;
