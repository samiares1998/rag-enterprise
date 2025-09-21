import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import type { AddNewDocument, Document, DocumentEdit } from '../../types/Index';
import AddDocument from "./AddDocument";
import EditDocument from "./EditDocument";
import ViewDocument from "./ViewDocument";

type DocumentsTableProps = {
  documents: Document[];
  onEdit?: (doc: DocumentEdit,id:string) => void;
  onDelete?: (doc: Document,path:string) => void;
  onAdd?: (doc: Omit<AddNewDocument, "_id">) => void;
};

const emptyDoc: AddNewDocument = {
  comments: "",
  archivo: {} as File, // archivo vacío inicial
};

export default function DocumentsTable({
  documents,
  onEdit,
  onDelete,
  onAdd,
}: DocumentsTableProps) {

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDoc, setNewDoc] = useState<AddNewDocument>(emptyDoc);

  const [search, setSearch] = useState("");

 

  const filteredDocs = documents.filter(
    (doc) =>
      doc.filename.toLowerCase().includes(search.toLowerCase()) ||
      doc._id.toLowerCase().includes(search.toLowerCase())
  );


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
              <th className="p-2">Status</th>
              <th className="p-2">Upload Date</th>
              <th className="p-2">Comments</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => (
              <tr
                key={doc._id}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                <td className="p-2 font-mono text-xs text-gray-700">
                  {doc._id.slice(0, 8)}...
                </td>
                <td className="p-2 font-medium text-gray-900">
                  {doc.filename}
                </td>
                <td
                  className={`p-2 capitalize text-gray-600 rounded-lg ${
                    doc.status === "processed" ? "text-green-800 font-medium" : ""
                  }`}
                >
                  {doc.status}
                </td>
                <td className="p-2 text-gray-600">
                  {new Date(doc.upload_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="p-2 text-gray-600 cursor-pointer">
                  {doc.comments}
                </td>
                <td className="p-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setIsViewOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setIsEditOpen(true);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete?.(doc,doc.path_original)}
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


    {isAddOpen && (
            <AddDocument
              isOpen={isAddOpen}
              onClose={() => {
                setIsAddOpen(false);
                setNewDoc(emptyDoc); // 🔹 limpiamos al cerrar
              }}
              onSave={(doc) => {
                onAdd?.(doc);
                setIsAddOpen(false);
                setNewDoc(emptyDoc); // 🔹 limpiamos después de guardar
              }}
            />
          )}
    

      {selectedDoc && (
        <EditDocument
          documentRaw={selectedDoc}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onEdit={(updatedDoc) => {
            onEdit?.(updatedDoc,selectedDoc._id);
            setIsEditOpen(false);
          }}
        />
      )}

      


    {selectedDoc && (
        <ViewDocument
          documentRaw={selectedDoc}
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
        />
      )}


    </div>






  );
}
