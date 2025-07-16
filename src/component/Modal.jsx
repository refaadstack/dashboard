import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative z-50">
          <DialogTitle className="text-lg font-semibold mb-4">{title}</DialogTitle>
          {children}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
