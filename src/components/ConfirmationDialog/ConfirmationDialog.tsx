import * as React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import styles from './ConfirmationDialog.module.css';

type Props = {
  isOpen: boolean;
  title: string;
  description: string;
  cancel: string;
  confirm: string;
  onConfirm: () => void;
  onOpenChange: (isOpen: boolean) => void;
};

const ConfirmationDialog = ({
  title,
  description,
  cancel,
  confirm,
  onConfirm,
  onOpenChange,
  isOpen
}: React.PropsWithChildren<Props>) => (
  <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className={styles.AlertDialogOverlay} />
      <AlertDialog.Content className={styles.AlertDialogContent}>
        <AlertDialog.Title className={styles.AlertDialogTitle}>
          {title}
        </AlertDialog.Title>
        <AlertDialog.Description className={styles.AlertDialogDescription}>
          {description}
        </AlertDialog.Description>
        <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
          <AlertDialog.Cancel asChild>
            <button className={`${styles.Button} ${styles.mauve}`}>{cancel}</button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button className={`${styles.Button} ${styles.red}`} onClick={onConfirm}>{confirm}</button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

export default ConfirmationDialog;
