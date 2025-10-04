import type { Document, DocumentsResponse, AddNewDocument } from '../types/Index';
import { useApi } from '../../../hooks/useApi';

// Hook personalizado para la API de documentos
export const useDocumentsApi = () => {
  const { GET, POST, PUT, DELETE } = useApi();

  const documentsApi = {
    // Obtener todos los documentos--------------------------------------------------------------------
    getDocuments: async (): Promise<DocumentsResponse> => {
      const result = await GET<DocumentsResponse>('/');

      if (!result.success) {
        throw new Error(result.error.message || `Error fetching documents: ${result.error.statusCode}`);
      }

      return result.data;
    },

    // Eliminar un documento--------------------------------------------------------------------
    deleteDocument: async (id: string, path_original: string): Promise<void> => {
      const result = await DELETE<{ message: string }>(
        `/files/${id}?path_original=${encodeURIComponent(path_original)}`
      );

      if (!result.success) {
        throw new Error(result.error.message || `Error deleting document: ${result.error.statusCode}`);
      }
    },

    // Actualizar un documento--------------------------------------------------------------------
    updateDocument: async (id: string, updates: Partial<AddNewDocument>): Promise<Document> => {
      const result = await PUT<Partial<AddNewDocument>, { document: Document }>(
        `/files/${id}`,
        updates
      );

      if (!result.success) {
        throw new Error(result.error.message || `Error updating document: ${result.error.statusCode}`);
      }

      // Asumiendo que tu backend retorna el documento actualizado
      return result.data.document;
    },

    // Añadir un documento--------------------------------------------------------------------
    addDocument: async (updates: Partial<AddNewDocument>): Promise<any> => {
    
      const formData = new FormData();

      if (updates.comments) formData.append("comments", updates.comments);
      if (updates.archivo) formData.append("file", updates.archivo);

     //Lo manejare asi para no tener que ajustar los headers del post global, ya que me tocaria crear dos 
     //funciones y validar 
      const response = await fetch(`'http://127.0.0.1:8000/api/v1'}/new_ingestion/ingest-file`, {
        method: "POST",
        body: formData,
        headers: {
          accept: "application/json",
         
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error adding document: ${response.status} - ${errText}`);
      }

      return response.json();
    },
  };

  return documentsApi;
};