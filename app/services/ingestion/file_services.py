from pathlib import Path
from typing import Any, Dict, List, Optional
from app.database.mongo_repository_documents import *
from app.services.exceptions.exceptions import DocumentNotFoundError, DocumentProcessingError
from app.services.vectorstore.chroma_store import delete_chunks_from_file
from app.services.mongo.mongo_services import mongo_document_service



async def update_file_service(doc_id: str, updates: dict):
    try:
        #  Validar ID
        if not ObjectId.is_valid(doc_id):
            print("Invalid document ID")
            return None

        # Convertir a dict si viene como modelo Pydantic
        if hasattr(updates, "dict"):
            update_data = {k: v for k, v in updates.dict().items() if v is not None}
        else:
            update_data = {k: v for k, v in updates.items() if v is not None}

        if not update_data:
            print("⚠️ No fields to update")
            return None

        result = update_file(doc_id,update_data)

        if result.matched_count == 0:
            print(" Document not found")
            return None

        return {"message": " Document updated"}
    
    except Exception as e:
        print(f" Error updating document: {str(e)}")
        return None
    
async def delete_file_service(doc_id: str):
    try:
        #  Validar que el ID sea correcto
        if not ObjectId.is_valid(doc_id):
            print(" ID inválido")
            return None

        result = await delete_file(doc_id)

        if result.deleted_count == 1:
            print(f" Documento {doc_id} eliminado correctamente")
            return {"message": "Document deleted", "id": doc_id}
        else:
            print(f"⚠️ Documento {doc_id} no encontrado")
            return {"message": "Document not found", "id": doc_id}

    except PyMongoError as e:
        print(f" Error eliminando documento: {e}")
        return {"error": str(e)}
    
    
async def delete_document_service(self, doc_id: str, path_original: str) -> Dict[str, Any]:
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
        
        