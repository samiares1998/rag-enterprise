import os
from typing import List, Optional, Dict, Any
from pathlib import Path
from fastapi import HTTPException

from app.repositories.mongo_repository import (
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
    
    async def delete_document(self, doc_id: str, path_original: str) -> Dict[str, Any]:
        """
        Elimina un documento completamente:
        - Archivo original
        - Archivo de chunks
        - Embeddings en Chroma
        - Registro en MongoDB
        """
        try:
            # 1. Validar que el documento existe
            files = await self.get_all_files(limit=1000)
            document_exists = any(f.get("_id") == doc_id for f in files)
            
            if not document_exists:
                raise DocumentNotFoundError(f"Document with ID {doc_id} not found")
            
            # 2. Rutas del archivo y sus chunks
            filename = Path(path_original).stem
            raw_file_path = self.raw_data_dir / Path(path_original).name
            chunks_path = self.chunks_dir / f"{filename}_chunks.json"
            
            deletion_results = {
                "raw_file_deleted": False,
                "chunks_file_deleted": False,
                "embeddings_deleted": False,
                "mongo_record_deleted": False
            }
            
            # 3. Eliminar embeddings en Chroma
            try:
                if chunks_path.exists():
                    delete_chunks_from_file(str(chunks_path))
                    deletion_results["embeddings_deleted"] = True
                    print(f"🗑️ Embeddings eliminados de Chroma para {chunks_path}")
            except Exception as e:
                print(f"⚠️ Error eliminando embeddings en Chroma: {e}")
            
            # 4. Eliminar archivo físico original
            try:
                if raw_file_path.exists():
                    raw_file_path.unlink()
                    deletion_results["raw_file_deleted"] = True
                    print(f"🗑️ Archivo eliminado: {raw_file_path}")
                else:
                    print(f"⚠️ Archivo no encontrado: {raw_file_path}")
            except Exception as e:
                print(f"⚠️ Error eliminando archivo original: {e}")
            
            # 5. Eliminar archivo de chunks
            try:
                if chunks_path.exists():
                    chunks_path.unlink()
                    deletion_results["chunks_file_deleted"] = True
                    print(f"🗑️ Chunks eliminados: {chunks_path}")
                else:
                    print(f"⚠️ Chunks no encontrados: {chunks_path}")
            except Exception as e:
                print(f"⚠️ Error eliminando archivo de chunks: {e}")
            
            # 6. Eliminar registro en MongoDB
            try:
                mongo_result = await delete_file(doc_id)
                if mongo_result and "message" in mongo_result:
                    deletion_results["mongo_record_deleted"] = True
                    print(f"🗑️ Registro eliminado en Mongo para ID {doc_id}")
            except Exception as e:
                print(f"⚠️ Error eliminando registro en MongoDB: {e}")
            
            return {
                "status": "deleted",
                "id": doc_id,
                "file": path_original,
                "deletion_details": deletion_results
            }
            
        except DocumentNotFoundError:
            raise
        except Exception as e:
            raise DocumentProcessingError(f"Error during document deletion: {str(e)}")
        

    
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