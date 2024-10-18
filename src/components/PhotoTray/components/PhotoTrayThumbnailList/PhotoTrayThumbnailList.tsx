import * as React from "react";
import style from "./PhotoTrayThumbnailList.module.css";
import PhotoTrayThumbnail from "../PhotoTrayThumbnail/PhotoTrayThumbnail";
import { deleteImageResource, JournalImage } from "@/helpers/indexdb";
import useHotkeyDeletePhotoResource from "../../hooks/use-hotkey-delete-photo-resource";

type Props = {
  images: Array<JournalImage>;
  setImages: (images: Array<JournalImage>) => void;
};

function PhotoTrayThumbnailList({ images, setImages }: React.PropsWithoutRef<Props>) {
  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(null);

  const deleteSelectedImage = async () => {
    if (!selectedImageId) {
      return;
    }
    const selectedIndex = images.findIndex((image) => image.id === selectedImageId);
    await deleteImageResource(selectedImageId);
    const newImages = images.filter((image) => image.id !== selectedImageId);
    setImages(newImages);
    console.log('index', selectedIndex);
    if (selectedIndex >= 0 && selectedIndex < images.length) {
      setSelectedImageId(newImages[selectedIndex].id);
    }
  };
  useHotkeyDeletePhotoResource(selectedImageId, () => deleteSelectedImage());

  return (
    <div className={style.container}>
      {images.map((image, index) => (
        <PhotoTrayThumbnail
          src={image.thumbDataUrl}
          key={image.id}
          height={image.thumbHeight}
          width={image.thumbWidth}
          tabIndex={index}
          selected={selectedImageId === image.id}
          onBlur={() => setSelectedImageId(null)}
          onFocus={() => setSelectedImageId(image.id)}
        />
      ))}
    </div>
  );
}

export default PhotoTrayThumbnailList;
