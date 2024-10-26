import { DependencyList } from "react";
import { useHotkeys } from "react-hotkeys-hook";

function useHotkeyDelete(selectdId: string|null, onItemDeleted: () => void, deps: DependencyList) {
  useHotkeys(
    "Delete,Backspace",
    () => {
      if (!selectdId) {
        return;
      }
      onItemDeleted();
    },
    { preventDefault: true },
    [selectdId, ...deps]
  );
}

export default useHotkeyDelete;
