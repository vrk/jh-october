import React from "react";
import * as Select from "@radix-ui/react-select";
import classnames from "classnames";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import style from "./DropdownSelect.module.css";

type DropdownOption = {
  value: string;
  title: string;
}

type DropdownProps = {
  title: string;
  value: string;
  onValueChanged: (value: string) => void;
  optionList: Array<DropdownOption>;
};

const DropdownSelect = ({
  title,
  value,
  onValueChanged,
  optionList
}: React.PropsWithoutRef<DropdownProps>) => (
  <Select.Root onValueChange={onValueChanged} value={value}>
    <Select.Trigger className={style.SelectTrigger} aria-label="Selection">
      <Select.Value placeholder={title} />
      <Select.Icon className={style.SelectIcon}>
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className={style.SelectContent}>
        <Select.ScrollUpButton className="SelectScrollButton">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className={style.SelectViewport}>
          <Select.Group>
            {optionList.map((option) => 
              <SelectItem value={option.value}>{option.title}</SelectItem>
            )}
          </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton className={style.SelectScrollButton}>
          <ChevronDownIcon />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

type SelectProps = {
  value: string;
  className?: string;
};

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<SelectProps>
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <Select.Item
      className={classnames("SelectItem", className)}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="SelectItemIndicator">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

export default DropdownSelect;
