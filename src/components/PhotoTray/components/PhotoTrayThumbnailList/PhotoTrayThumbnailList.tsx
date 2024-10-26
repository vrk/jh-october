import * as React from "react";
import style from "./PhotoTrayThumbnailList.module.css";
import PhotoTrayThumbnail from "../PhotoTrayThumbnail/PhotoTrayThumbnail";
import useHotkeyDelete from "../../../../hooks/use-hotkey-delete-photo-resource";
import useHotkeyImageNav from "../../../../hooks/use-hotkey-photo-nav";
import { JournalImage } from "@/helpers/data-types";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

type Props = {
  images: Array<JournalImage>;
};

function PhotoTrayThumbnailList({
  images,
}: React.PropsWithoutRef<Props>) {
  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(
    null
  );
  const journalContext = React.useContext(JournalContext);

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
    journalContext.deleteLoadedImage(selectedImageId);
  };
  useHotkeyDelete(selectedImageId, () => deleteSelectedImage(), [journalContext]);
  useHotkeyImageNav(images, selectedImageId, setSelectedImageId, [journalContext]);

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
          onFocus={() => { console.log('selected', image.id); setSelectedImageId(image.id) }}
        />
      ))}
    </div>
  );
}

export default PhotoTrayThumbnailList;
