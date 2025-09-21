import { useState, useEffect } from 'react';
import type { Document,DocumentEdit } from '../types/Index';
import type { AddNewDocument } from '../types/Index';
import { documentsApi } from '../services/api';
import Swal from "sweetalert2"

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar documentos
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documentsApi.getDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar documento
  const deleteDocument = async (id: string,path:string) => {
    try {
      await documentsApi.deleteDocument(id,path);
      // Actualizar la lista localmente después de eliminar
      setDocuments(prev => prev.filter(doc => doc._id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error deleting document');
    }
  };

  // Actualizar documento
  const updateDocument = async (id: string, updates: Partial<DocumentEdit>) => {
    try {
      const updatedDoc = await documentsApi.updateDocument(id, updates);
      // Actualizar la lista localmente
      loadDocuments();
      return updatedDoc;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error updating document');
    }
  };


    // Añadir documento
    const addDocument = async (newDocument: Partial<AddNewDocument>) => {
      try {
        await documentsApi.addDocument(newDocument);
        // Actualizar la lista localmente
        loadDocuments();
        Swal.fire({
          icon: "success",
          title: "Documento subido",
          text: "Se guardó correctamente 🎉",
          confirmButtonColor: "#2563eb", // azul tailwind
        })
      } catch (err) {
        //throw new Error(err instanceof Error ? err.message : 'Error adding document');
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo subir el documento 😢",
        })
      }
    };


  // Cargar documentos al montar el componente
  useEffect(() => {
    loadDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    refresh: loadDocuments,
    deleteDocument,
    updateDocument,
    addDocument
  };
};