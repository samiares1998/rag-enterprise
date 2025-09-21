import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalProps = {
    isOpen: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
    size?: "sm" | "lg" | "xl" | "full";
  };
  
  export default function Modal({ isOpen, title, children, onClose, size = "sm" }: ModalProps) {
    if (!isOpen) return null;
  
    const sizeClasses = {
      sm: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-5xl h-[80vh]",
      full: "w-[95vw] h-[90vh]",
    };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={onClose} />
        <div
          className={`relative bg-white rounded-2xl shadow-lg w-full p-6 animate-fadeIn z-10 ${sizeClasses[size]}`}
        >
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
          <div className="h-full overflow-auto">{children}</div>
        </div>
      </div>
    );
  }
  