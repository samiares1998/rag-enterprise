import React from "react";
import { Document } from "../../../types/document";

interface EditButtonProps {
  doc: Document;
  onEdit?: (doc: Document) => void;
}

const EditButton: React.FC<EditButtonProps> = ({ doc, onEdit }) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(doc); // abrir modal en el padre
    } else {
      console.log("Editar documento", doc);
      // aquí podrías abrir un modal con el form
    }
  };

  return (
    <button
      onClick={handleEdit}
      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
    >
      Editar
    </button>
  );
};

export default EditButton;
