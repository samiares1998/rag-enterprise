import React from "react";
import api from "../../../services/api";
import { Document } from "../../../types/document";

interface AddModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: (docs: Document[]) => void;
}

const AddModal: React.FC<AddModalProps> = ({ open, onClose, onAdded }) => {
  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await api.post("ingestion/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await api.get<Document[]>("ingestion/files");
      onAdded(res.data);
      onClose();
    } catch (err) {
      console.error("Error al subir documento:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg space-y-4">
        <input type="file" name="file" required />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Subir
          </button>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddModal;
