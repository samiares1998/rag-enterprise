import React from "react";
import api from "../../../services/api";
import { Document } from "../../../types/document";

interface EditModalProps {
  doc: Document | null;
  onClose: () => void;
  onUpdated: (docs: Document[]) => void;
}

const EditModal: React.FC<EditModalProps> = ({ doc, onClose, onUpdated }) => {
  const [filename, setFilename] = React.useState(doc?.filename || "");

  if (!doc) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`ingestion/files/${doc.id}`, { filename });
      const res = await api.get<Document[]>("ingestion/files");
      onUpdated(res.data);
      onClose();
    } catch (err) {
      console.error("Error al editar:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg space-y-4">
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">
            Guardar
          </button>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditModal;
