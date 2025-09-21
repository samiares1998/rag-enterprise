import type { Document } from '../types/Index';
import type { AddNewDocument } from '../types/Index';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const documentsApi = {
  // Obtener todos los documentos
  getDocuments: async (): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/ingestion/files`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching documents: ${response.statusText}`);
    }

    return response.json();
  },

  // Eliminar un documento
  deleteDocument: async (id: string, path_original: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/ingestion/files/${id}?path_original=${encodeURIComponent(path_original)}`,
      {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        },
      }
    );
  
    if (!response.ok) {
      throw new Error(`Error deleting document: ${response.statusText}`);
    }
  },

  // Actualizar un documento
  updateDocument: async (id: string, updates: Partial<AddNewDocument>): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/ingestion/files/${id}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Error updating document: ${response.statusText}`);
    }

    return response.json();
  },

   // añadir un documento
   addDocument: async (updates: Partial<AddNewDocument>): Promise<any> => {
    const formData = new FormData();
  
    if (updates.comments) formData.append("comments", updates.comments);
    if (updates.archivo) formData.append("file", updates.archivo); // 👈 nombre exacto al backend
  
    const response = await fetch(`${API_BASE_URL}/ingestion/ingest-file`, {
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