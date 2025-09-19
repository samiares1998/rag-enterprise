"use client";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Document } from "../../types/document";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

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

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("ingestion/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchDocuments(); // refresca la lista
      setShowUploadModal(false);
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`ingestion/files/${id}`);
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          DOCUMENTS RECENT
        </h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Añadir nuevo documento
        </button>
      </div>

      {/* Tabla */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : (
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500">
                  Filename
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500">
                  Content Type
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500">
                  Upload Date
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="py-3 text-gray-800 dark:text-white/90">
                    {doc.filename}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                    {doc.content_type}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                    {new Date(doc.upload_date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="py-3 flex gap-3">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="text-blue-600 hover:underline"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => alert("Aquí iría la lógica de editar ✏️")}
                      className="text-yellow-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal Ver Documento */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-11/12 h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {selectedDoc.filename}
              </h2>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => setSelectedDoc(null)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src={selectedDoc.path}
                title={selectedDoc.filename}
                className="w-full h-full rounded-b-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Subir Documento */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-1/3 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Añadir nuevo documento
            </h2>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
