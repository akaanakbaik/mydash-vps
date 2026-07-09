import { type ReactNode } from 'react';
import { Modal } from './Modal.js';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  children?: ReactNode;
}

export function Dialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', children }: DialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {description && <p className="mb-6 text-sm text-[hsl(var(--color-muted))]">{description}</p>}
      {children}
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="rounded-lg border border-[hsl(var(--color-border))] px-4 py-2 text-sm hover:bg-[hsl(var(--color-border))]">
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
            variant === 'danger' ? 'bg-[hsl(var(--color-danger))]' : 'bg-[hsl(var(--color-primary))]'
          } hover:brightness-110`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
