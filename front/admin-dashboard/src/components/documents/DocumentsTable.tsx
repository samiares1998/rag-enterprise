import { useState } from "react";
import { Search, Eye, Pencil, Trash2, MoreHorizontal, Plus } from "lucide-react";
import Modal from "../ui/Modal";

export type Document = {
  id: string;
  filename: string;
  content_type: string;
  upload_date: string;
  path: string;
};

type DocumentsTableProps = {
  documents: Document[];
  onView?: (doc: Document) => void;
  onEdit?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  onAdd?: (doc: Omit<Document, "id">) => void;
};

export default function DocumentsTable({
  documents,
  onView,
  onEdit,
  onDelete,
  onAdd,
}: DocumentsTableProps) {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDoc, setNewDoc] = useState<Omit<Document, "id">>({
    filename: "",
    content_type: "",
    upload_date: new Date().toISOString(),
    path: "",
  });

  const filteredDocs = documents.filter(
    (doc) =>
      doc.filename.toLowerCase().includes(search.toLowerCase()) ||
      doc.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (newDoc.filename && newDoc.path) {
      onAdd?.(newDoc);
      setIsAddOpen(false);
      setNewDoc({
        filename: "",
        content_type: "",
        upload_date: new Date().toISOString(),
        path: "",
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Documents</h2>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by filename or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-500 text-sm">
              <th className="p-2">ID</th>
              <th className="p-2">Filename</th>
              <th className="p-2">Type</th>
              <th className="p-2">Upload Date</th>
              <th className="p-2">Path</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => (
              <tr
                key={doc.id}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                <td className="p-2 font-mono text-xs text-gray-700">
                  {doc.id.slice(0, 8)}...
                </td>
                <td className="p-2 font-medium text-gray-900">
                  {doc.filename}
                </td>
                <td className="p-2 capitalize text-gray-600">
                  {doc.content_type.replace("-", " ")}
                </td>
                <td className="p-2 text-gray-600">
                  {new Date(doc.upload_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="p-2 text-blue-600 underline cursor-pointer">
                  {doc.path}
                </td>
                <td className="p-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => onView?.(doc)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit?.(doc)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete?.(doc)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-6">
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Document
        </button>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        title="Add New Document"
        onClose={() => setIsAddOpen(false)}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Filename"
            value={newDoc.filename}
            onChange={(e) =>
              setNewDoc((prev) => ({ ...prev, filename: e.target.value }))
            }
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Content Type"
            value={newDoc.content_type}
            onChange={(e) =>
              setNewDoc((prev) => ({ ...prev, content_type: e.target.value }))
            }
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            placeholder="Path"
            value={newDoc.path}
            onChange={(e) =>
              setNewDoc((prev) => ({ ...prev, path: e.target.value }))
            }
            className="w-full border rounded p-2"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
