import Modal from "../../../components/ui/Modal";
import { useState } from "react";
import type { Document,DocumentEdit } from "../types/Index";

type EditDocumentProps = {
  documentRaw: Document;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (doc: DocumentEdit) => void;
};

export default function EditDocument({
  documentRaw,
  isOpen,
  onClose,
  onEdit,
}: EditDocumentProps) {

  const [newDoc, setNewDoc] = useState<DocumentEdit>({
    comments: documentRaw.comments || "",
  });

  const handleEdit = () => {
    console.log("Saving doc:", newDoc);
    onEdit?.(newDoc); // ← devolvemos el doc editado
    onClose(); // cerramos modal
  };

  return (
    <Modal
      isOpen={isOpen}
      title="✏️ Edit Document Information"
      onClose={onClose}
    >
      <div className="space-y-5">
        {/* Filename */}
        <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Filename</label>
        <p className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-gray-100 text-gray-700 shadow-sm">
          {documentRaw.filename || "No filename available"}
        </p>
      </div>


        {/* Content Type */}
        <div className="space-y-1">
          <label
            htmlFor="comments"
            className="text-sm font-medium text-gray-700"
          >
            Comments
          </label>
          <input
            id="comments"
            name="comments"
            type="text"
            placeholder="e.g. local-file, pdf"
            value={newDoc.comments}
            onChange={(e) =>
              setNewDoc((prev) => ({ ...prev, comments: e.target.value }))
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
        />
        </div>

        {/* Path */}
        <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Path</label>
        <p className="w-full rounded-xl border border-gray-300 px-4 py-2 bg-gray-100 text-gray-700 shadow-sm">
          {documentRaw.path_original || "No filename available"}
        </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
