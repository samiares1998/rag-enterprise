import os
from typing import List, Optional, Dict, Any
from pathlib import Path
from fastapi import HTTPException

from app.database.mongo_repository_documents import (
    save_register, 
    get_files, 
    update_file, 
    delete_file
)
RAW_DATA_DIR = "front/admin-dashboard/data/raw"
CHUNKS_DIR = "front/admin-dashboard/data/chunks"

from app.services.vectorstore.chroma_store import delete_chunks_from_file

from app.services.exceptions.exceptions import DocumentNotFoundError, DocumentProcessingError

class MongoDocumentService:
    def __init__(self):
        self.raw_data_dir = Path(RAW_DATA_DIR)
        self.chunks_dir = Path(CHUNKS_DIR)
    
    async def save_document_register(
        self, 
        file, 
        chunks_path: str, 
        comments: Optional[str] = None, 
        status: str = "processed"
    ) -> Dict[str, Any]:
        """
        Guarda el registro de un documento procesado en MongoDB
        """
        try:
            result = await save_register(file, chunks_path, comments, status)
            if not result:
                raise DocumentProcessingError("Failed to save document register in MongoDB")
            return result
        except Exception as e:
            raise DocumentProcessingError(f"Error saving document register: {str(e)}")
        

    
    async def get_all_files(
        self, 
        limit: int = 20, 
        skip: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Obtiene todos los documentos con paginación
        """
        try:
            files = await get_files(limit + skip)
            # Implementar paginación manual ya que tu repositorio no la tiene
            return files[skip:skip + limit]
        except Exception as e:
            raise DocumentProcessingError(f"Error retrieving files: {str(e)}")
    
    async def get_file_by_id(self, doc_id: str) -> Dict[str, Any]:
        """
        Obtiene un documento específico por ID
        """
        try:
            # Necesitarías agregar este método en tu repositorio
            files = await get_files(limit=1000)  # Temporal hasta que agregues get_by_id
            for file in files:
                if file.get("_id") == doc_id:
                    return file
            
            raise DocumentNotFoundError(f"Document with ID {doc_id} not found")
        except DocumentNotFoundError:
            raise
        except Exception as e:
            raise DocumentProcessingError(f"Error retrieving file: {str(e)}")
        

    
    async def update_document(
        self, 
        doc_id: str, 
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Actualiza un documento existente
        """
        try:
            result = await update_file(doc_id, updates)
            if not result:
                raise DocumentNotFoundError(f"Document with ID {doc_id} not found")
            return result
        except DocumentNotFoundError:
            raise
        except Exception as e:
            raise DocumentProcessingError(f"Error updating document: {str(e)}")
    
    async def search_files(
        self, 
        filename: Optional[str] = None,
        status: Optional[str] = None,
        content_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Busca documentos por criterios específicos
        """
        try:
            all_files = await self.get_all_files(limit=1000)
            filtered_files = all_files
            
            if filename:
                filtered_files = [f for f in filtered_files if filename.lower() in f.get("filename", "").lower()]
            
            if status:
                filtered_files = [f for f in filtered_files if f.get("status") == status]
            
            if content_type:
                filtered_files = [f for f in filtered_files if content_type in f.get("content_type", "")]
            
            return filtered_files
        except Exception as e:
            raise DocumentProcessingError(f"Error searching files: {str(e)}")

# Instancia global para usar en los controllers
mongo_document_service = MongoDocumentService()