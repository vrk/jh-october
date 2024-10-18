import React from "react";
import style from "./DropdownSelect.module.css";

type DropdownOption<T> = {
  value: T;
  title: string;
};

type DropdownProps<T> = {
  title: string;
  defaultValue: T;
  value: T;
  onValueChanged: (value: T) => void;
  optionList: Array<DropdownOption<T>>;
};

function DropdownSelect<T extends string>({
  title,
  value,
  onValueChanged,
  optionList,
}: React.PropsWithoutRef<DropdownProps<T>>) {
  return (
    <div className={style.container}>
      <select
        onChange={(event) => onValueChanged(event.target.value as T)}
        value={value}
      >
        {optionList.map((option) => (
          <option key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DropdownSelect;
