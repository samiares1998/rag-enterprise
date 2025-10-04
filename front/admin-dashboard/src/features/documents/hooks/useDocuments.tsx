import { useState, useEffect } from 'react';
import type { Document } from '../types/Index';
import { useDocumentsApi } from '../services/documentService';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const documentService = useDocumentsApi();
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documentService.getDocuments();
      setDocuments(docs.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading documents');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    refresh: loadDocuments,
  };
};