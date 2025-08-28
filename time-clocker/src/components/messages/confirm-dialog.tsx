import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { DEFAULT_DIALOG_TEXTS} from "../../constants/dialog";

import type { DialogButtonProps, ConfirmDialogProps } from "../../types/messages";

const DialogButton = ({ onClick, children, className = "" }: DialogButtonProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md transition-colors ${className}`}
  >
    {children}
  </button>
);

export function ConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title = DEFAULT_DIALOG_TEXTS.title,
  message = DEFAULT_DIALOG_TEXTS.message,
  cancelText = DEFAULT_DIALOG_TEXTS.cancelText,
  confirmText = DEFAULT_DIALOG_TEXTS.confirmText,
}: ConfirmDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <Dialog.Title
                as="h3"
                className="text-lg font-medium text-gray-900"
              >
                {title}
              </Dialog.Title>

              <Dialog.Description className="mt-2 text-sm text-gray-600">
                {message}
              </Dialog.Description>

              <div className="mt-4 flex justify-end space-x-3">
                <DialogButton
                  onClick={onCancel}
                  className="bg-gray-200 hover:bg-gray-300"
                >
                  {cancelText}
                </DialogButton>
                <DialogButton
                  onClick={onConfirm}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {confirmText}
                </DialogButton>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
