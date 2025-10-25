import { useCallback } from "react";
import type { Document, DocumentEdit, AddNewDocument } from "../types/Index";
import { useDocumentsApi } from "../services/documentService";
import { useAlerts } from "../../../hooks/useAlerts";

export const useDocumentOperations = (refresh: () => void) => {
  const documentService = useDocumentsApi();
  const { showConfirmation, showSuccess, showError } = useAlerts(); //constantes para mostrar las alertas 

  const handleEdit = useCallback(async (doc: DocumentEdit, id: string) => {
    const confirmed = await showConfirmation(
      "Are you sure?",
      `Do you want to edit "${doc.filename}"?`,
      "warning",
      "Yes, edit it!"
    );

    if (!confirmed) return;

    try {
      await documentService.updateDocument(id, doc);
      showSuccess("✅ Updated!", "The document has been updated.");
      refresh();
    } catch (error) {
      showError("Update Failed", "Failed to update document.");
    }
  }, [refresh, showConfirmation, showSuccess, showError]);

  //---------------------------------------------------------------------------

  const handleDelete = useCallback(async (doc: Document, path: string) => {
    const confirmed = await showConfirmation(
      "Delete Document?",
      `This will permanently delete "${doc.filename}".`,
      "error",
      "Yes, delete it!"
    );

    if (!confirmed) return;

    try {
      await documentService.deleteDocument(doc._id, path);
      showSuccess("🗑️ Deleted!", "The document has been removed.");
      refresh();
    } catch (error) {
      showError("Delete Failed", "Failed to delete document.");
    }
  }, [refresh, showConfirmation, showSuccess, showError]);

  //---------------------------------------------------------------------------

  const handleAdd = useCallback(async (newDoc: Omit<AddNewDocument, "_id">) => {
    try {
      await documentService.addDocument(newDoc);
      showSuccess("🎉 Added!", "The new document was added successfully.");
      refresh();
    } catch (error) {
      showError("Add Failed", "Failed to add new document.");
    }
  }, [refresh, showSuccess, showError]);

  //---------------------------------------------------------------------------

  return {
    handleEdit,
    handleDelete,
    handleAdd
  };

  //---------------------------------------------------------------------------
};