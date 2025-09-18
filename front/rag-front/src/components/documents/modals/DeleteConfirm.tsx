import React from "react";
import api from "../../../services/api";
import { Document } from "../../../types/document";

interface DeleteConfirmProps {
  id: number | null;
  onClose: () => void;
  onDeleted: (docs: Document[]) => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ id, onClose, onDeleted }) => {
  if (!id) return null;

  const handleDelete = async () => {
    try {
      await api.delete(`ingestion/files/${id}`);
      const res = await api.get<Document[]>("ingestion/files");
      onDeleted(res.data);
      onClose();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg space-y-4">
        <p>¿Seguro que quieres eliminar este documento?</p>
        <div className="flex gap-2">
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
            Eliminar
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
