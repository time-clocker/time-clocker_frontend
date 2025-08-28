export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface DialogButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}