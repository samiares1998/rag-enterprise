import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({ isOpen, title, children, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 animate-fadeIn z-10">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}
