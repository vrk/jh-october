import * as React from "react";
import style from "./PhotoTrayThumbnailList.module.css";
import PhotoTrayThumbnail from "../PhotoTrayThumbnail/PhotoTrayThumbnail";
import { deleteImageResource, JournalImage } from "@/helpers/indexdb";
import useHotkeyDeletePhotoResource from "../../hooks/use-hotkey-delete-photo-resource";
import useHotkeyPhotoNav from "../../hooks/use-hotkey-photo-nav";

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
    if (selectedIndex >= 0) {
      if (selectedIndex < newImages.length) {
        setSelectedImageId(newImages[selectedIndex].id);
      } else if (selectedIndex > 0) {
        // Set to last element in the list
        setSelectedImageId(newImages[selectedIndex - 1].id);
      }
    }
  };
  useHotkeyDeletePhotoResource(selectedImageId, () => deleteSelectedImage());
  useHotkeyPhotoNav(images, selectedImageId, setSelectedImageId);

  return (
    <div className={style.container} onBlur={() => { console.log('blurring'); setSelectedImageId(null) }}>
      {images.map((image, index) => (
        <PhotoTrayThumbnail
          key={image.id}
          image={image}
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
