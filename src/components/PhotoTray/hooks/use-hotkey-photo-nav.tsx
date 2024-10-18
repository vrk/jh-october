import { JournalImage } from "@/helpers/indexdb";
import { useHotkeys } from "react-hotkeys-hook";

function useHotkeyPhotoNav(
  images: Array<JournalImage>,
  selectedId: string|null,
  setSelectedId: (selectedId: string) => void,
  itemsPerRow = 1
) {
  function getIndex(selectedId: string) {
    return images.findIndex((image) => image.id === selectedId);
  }
  function getId(index: number) {
    return images[index].id;
  }
  useHotkeys(
    "left",
    () => {
      if (!selectedId) {
        return;
      }
      const currentIndex = getIndex(selectedId);
      if (currentIndex - 1 >= 0) {
        const newId = getId(currentIndex - 1);
        setSelectedId(newId);
      }
    },
    { preventDefault: true },
    [images, selectedId, setSelectedId]
  );
  useHotkeys(
    "right",
    () => {
      if (!selectedId) {
        return;
      }
      const currentIndex = getIndex(selectedId);
      if (currentIndex + 1 < images.length) {
        const newId = getId(currentIndex + 1);
        setSelectedId(newId);
      }
    },
    { preventDefault: true },
    [images, selectedId, setSelectedId]
  );
  useHotkeys(
    "up",
    () => {
      if (!selectedId) {
        return;
      }
      const currentIndex = getIndex(selectedId);
      if (currentIndex - itemsPerRow >= 0) {
        const newId = getId(currentIndex - itemsPerRow);
        setSelectedId(newId);
      }
    },
    { preventDefault: true },
    [images, selectedId, setSelectedId]
  );
  useHotkeys(
    "down",
    () => {
      if (!selectedId) {
        return;
      }
      const currentIndex = getIndex(selectedId);
      if (currentIndex + itemsPerRow < images.length) {
        const newId = getId(currentIndex + itemsPerRow);
        setSelectedId(newId);
      }
    },
    { preventDefault: true },
    [images, selectedId, setSelectedId]
  );
}

export default useHotkeyPhotoNav;
