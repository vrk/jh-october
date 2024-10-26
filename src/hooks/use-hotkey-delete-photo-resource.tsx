import { useHotkeys } from "react-hotkeys-hook";

function useHotkeyDelete(selectdId: string|null, onItemDeleted: () => void) {
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

export default useHotkeyDelete;
