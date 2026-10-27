import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./Button";

// "Are you sure?" built on the native <dialog> element. showModal() gives us, for free:
// the page behind becomes inert, focus stays inside, and Escape closes it.
// The SAFE choice ("Cancel") gets focus first, so pressing Enter by accident never deletes anything.
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, children, confirmLabel, danger = false, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="hh-dialog" aria-labelledby="hh-dialog-title" onCancel={(e) => (e.preventDefault(), onCancel())}>
      <h2 id="hh-dialog-title" className="hh-dialog__title">
        {title}
      </h2>
      {children}
      <div className="hh-dialog__actions">
        <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
