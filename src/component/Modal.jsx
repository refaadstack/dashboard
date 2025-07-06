import { Dialog } from "@headlessui/react";

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="bg-white rounded-lg shadow-lg max-w-md w-full z-50 p-6 relative">
          <Dialog.Title className="text-lg font-semibold mb-4">{title}</Dialog.Title>
          {children}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>
      </div>
    </Dialog>
  );
}
