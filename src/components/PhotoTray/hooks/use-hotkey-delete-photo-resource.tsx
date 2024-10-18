import { useHotkeys } from "react-hotkeys-hook";

function useHotkeyDeletePhotoResource(selectdId: string|null, onItemDeleted: () => void) {
  useHotkeys(
    "Delete,Backspace",
    () => {
      if (!selectdId) {
        return;
      }
      onItemDeleted();
    },
    { preventDefault: true },
    [selectdId]
  );
}

export default useHotkeyDeletePhotoResource;
