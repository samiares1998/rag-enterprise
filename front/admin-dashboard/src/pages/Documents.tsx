import DocumentsTable from "../components/documents/DocumentsTable";
import { useDocuments } from "../hooks/useDocuments";
import type { Document,DocumentEdit } from "../types/Index";
import type { AddNewDocument } from "../types/Index";
import Swal from "sweetalert2";

export default function Documents() {
  const {
    documents,
    loading,
    error,
    deleteDocument,
    updateDocument,
    addDocument,
    refresh,
  } = useDocuments();

  // ✏️ Editar documento
  const handleEdit = async (doc: DocumentEdit,id:string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to edit "${doc.filename}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, edit it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await updateDocument(id, doc);
      Swal.fire("✅ Updated!", "The document has been updated.", "success");
    }
  };

  // 🗑️ Eliminar documento
  const handleDelete = async (doc: Document,path:string) => {
    const result = await Swal.fire({
      title: "Delete Document?",
      text: `This will permanently delete "${doc.filename}".`,
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await deleteDocument(doc._id,path);
      Swal.fire("🗑️ Deleted!", "The document has been removed.", "success");
    }
  };

  // ➕ Añadir documento
  const handleAdd = async (newDoc: Omit<AddNewDocument, "_id">) => {
    await addDocument(newDoc);
    await refresh();
    Swal.fire("🎉 Added!", "The new document was added successfully.", "success");
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <DocumentsTable
      documents={documents}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  );
}
