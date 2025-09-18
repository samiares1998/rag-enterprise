import React from "react";
import { Document } from "../../../types/document";

interface ViewButtonProps {
  doc: Document;
  onView?: (doc: Document) => void;
}

const ViewButton: React.FC<ViewButtonProps> = ({ doc, onView }) => {
  const handleView = () => {
    if (onView) {
      onView(doc);
    } else {
      window.open(doc.path, "_blank"); // abrir documento directamente
    }
  };

  return (
    <button
      onClick={handleView}
      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Ver
    </button>
  );
};

export default ViewButton;
