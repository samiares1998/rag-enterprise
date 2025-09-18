"use client";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Document } from "../../types/document";
import DocumentRow from "./ DocumentRow";
import AddButton from "./actions/AddButton";

// Modales
import ViewModal from "./modals/ViewModal";
import AddModal from "./modals/AddModal";
import EditModal from "./modals/EditModal";
import DeleteConfirm from "./modals/DeleteConfirm";

export default function DocumentsTable() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // estados para los modales
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get<Document[]>("ingestion/files");
        setDocuments(res.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleView = (doc: Document) => {
    setSelectedDoc(doc);
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Documentos recientes</h3>
        <AddButton onAdd={handleAdd} />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2">Filename</th>
              <th className="text-left py-2">Content Type</th>
              <th className="text-left py-2">Upload Date</th>
              <th className="text-left py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      )}

      {/* Modales */}
      <ViewModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
        
      <AddModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={setDocuments}
      />
      <EditModal
        doc={editingDoc}
        onClose={() => setEditingDoc(null)}
        onUpdated={setDocuments}
      />
      <DeleteConfirm
        id={deletingId}
        onClose={() => setDeletingId(null)}
        onDeleted={setDocuments}
      />
    </div>
  );
}
