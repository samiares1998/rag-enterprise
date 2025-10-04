import Modal from "../../../components/ui/Modal";
import { useState } from "react";
import type { AddNewDocument } from "../types/Index";

type AddDocumentProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (doc: Omit<AddNewDocument, "_id">) => void; // 🚀 quitamos _id, lo genera backend
};

// Estado inicial
const emptyDoc: Omit<AddNewDocument, "_id"> = {
  comments: "",
  archivo: {} as File,
};

export default function AddDocument({
  isOpen,
  onClose,
  onSave,
}: AddDocumentProps) {
  const [newDoc, setNewDoc] = useState<Omit<AddNewDocument, "_id">>(emptyDoc);

  const handleSave = () => {
    console.log("Saving doc:", newDoc);
    onSave?.(newDoc); // devolvemos el nuevo doc sin _id
    onClose(); // cerramos modal
    setNewDoc(emptyDoc); // 🔹 limpiamos después de guardar
  };

  return (
    <Modal isOpen={isOpen} title="➕ Add New Document" onClose={onClose}>
      <div className="space-y-5">
        {/* Comments */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Comments</label>
          <input
            type="text"
            placeholder="Enter comments..."
            value={newDoc.comments}
            onChange={(e) =>
              setNewDoc((prev) => ({ ...prev, comments: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">File</label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setNewDoc((prev) => ({
                  ...prev,
                  archivo: file, // 🚀 guardamos el archivo real
                }));
              }
            }}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              setNewDoc(emptyDoc); // 🔹 limpiamos al cancelar también
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!newDoc.archivo} // 🚀 validamos que sí haya archivo
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
