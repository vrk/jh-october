import * as React from "react";
import style from "./PhotoTrayThumbnailList.module.css";
import PhotoTrayThumbnail from "../PhotoTrayThumbnail/PhotoTrayThumbnail";
import { JournalImage } from "@/helpers/indexdb";
import useHotkeyDelete from "../../../../hooks/use-hotkey-delete-photo-resource";
import useHotkeyImageNav from "../../../../hooks/use-hotkey-photo-nav";

type Props = {
  images: Array<JournalImage>;
  deleteImage: (id: string) => void;
};

function PhotoTrayThumbnailList({
  images,
  deleteImage,
}: React.PropsWithoutRef<Props>) {
  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(
    null
  );

  // See if selected image id is no longer valid, and clear if so.
  // This happens if `images` has updated, causing a rerender but not clearing all state.
  // TODO: This feels a bit weird - I wanna revisit this later and see if it makes sense.
  if (selectedImageId && !images.map((i) => i.id).includes(selectedImageId)) {
    setSelectedImageId(null);
  }

  const deleteSelectedImage = async () => {
    if (!selectedImageId) {
      return;
    }
    const imageToDelete = images.find(i => i.id === selectedImageId);
    if (!imageToDelete) {
      throw new Error('assertion error -- image to delete was not found')
    }
    deleteImage(imageToDelete.id);
  };
  useHotkeyDelete(selectedImageId, () => deleteSelectedImage());
  useHotkeyImageNav(images, selectedImageId, setSelectedImageId);

  return (
    <div
      className={style.container}
      onBlur={() => {
        setSelectedImageId(null);
      }}
    >
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
