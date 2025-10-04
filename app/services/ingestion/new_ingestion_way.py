from pathlib import Path
import os
import re
import shutil
import json
import uuid
from fastapi import UploadFile, HTTPException
from llama_index.core import SimpleDirectoryReader
import hashlib
from app.services.ingestion.new_chunker_way import chunker 
from app.services.vectorstore.chroma_store import index_chunks_from_file
from app.services.mongo.mongo_services import save_register
from app.services.exceptions.exceptions import *

from app.services.ingestion.loaders import load_file

RAW_DATA_DIR = "front/admin-dashboard/data/raw"
CHUNKS_DIR = "front/admin-dashboard/data/chunks"


class DocumentProcessor:

    def __init__(self):
        self.raw_dir = Path(RAW_DATA_DIR)
        self.chunks_dir = Path(CHUNKS_DIR)
        self._ensure_dirs()
    
    def _ensure_dirs(self):
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        self.chunks_dir.mkdir(parents=True, exist_ok=True)
    
    def _sanitize_filename(self, filename: str) -> str:

        """Sanitiza el nombre del archivo para prevenir path traversal

        Usamos regex ya que es lo mas comun 

        ejemplo : 
        
        _sanitize_filename("../../etc/passwd")  
        # Resultado: "etcpasswd"

        _sanitize_filename("  my file@2025!!.pdf  ")  
        # Resultado: "my file2025.pdf"

        _sanitize_filename("****")  
        # Resultado: "document"
        
        """

        safe_name = re.sub(r"[^a-zA-Z0-9._\- ]", "", filename).strip()
        return safe_name or "document"
    
    def _get_file_paths(self, original_filename: str) -> tuple[Path, Path]: #retorno dos paths 
        """Obtiene rutas seguras para archivo original y chunks       
        """

        safe_name = self._sanitize_filename(original_filename)
        file_path = self.raw_dir / safe_name
        chunks_path = self.chunks_dir / f"{safe_name}_chunks.json"
        return file_path, chunks_path
    
    async def _save_uploaded_file(self, file: UploadFile, destination: Path) -> None:
        """Guarda el archivo subido de forma segura"""
        try:
            with destination.open("wb") as buffer: #abro el archivo destination 
                # Limitar tamaño del archivo (ej: 100MB)
                content = await file.read()
                if len(content) > 100 * 1024 * 1024:
                    raise DocumentProcessingError("File too large")
                
                buffer.write(content)
        except Exception as e:
            if destination.exists():
                destination.unlink()  # borrar equivalente a os.remove()
            raise DocumentProcessingError(f"Failed to save file: {str(e)}")
        
        

    def make_id(text: str) -> str:
        return hashlib.md5(text.encode("utf-8")).hexdigest()
    
    def _load_and_chunk_document(self, file_path: Path) -> list:
        """Carga el documento y aplica chunking"""
        if not file_path.exists():
            raise DocumentProcessingError("File not found after saving")
        
        try:
            # Cargar documento con LlamaIndex
            documents = SimpleDirectoryReader(input_files=[str(file_path)]).load_data()
            
            # Validar que documents no esté vacío y tenga contenido
            if not documents or all(len(doc.text.strip()) == 0 for doc in documents):
                # Caso: documento vacío o sin texto, usar método alternativo
                text = load_file(file_path)
                documents_dict = [
                    {
                        "id_": self.make_id(text),  # siempre el mismo ID para el mismo texto
                        "text": text,
                        "metadata": {
                            "source": str(file_path),
                            "alternative_loading": True
                        }
                    }
                ]
            else:
                # Caso normal: documento con texto
                file_hash = hashlib.md5(file_path.read_bytes()).hexdigest()[:8]
                documents_dict = [
                    {
                        "id_": f"{file_hash}_{i}",  # único por archivo+chunk
                        "text": doc.text,
                        "metadata": {**doc.metadata, "source": str(file_path)}
                    }
                    for i, doc in enumerate(documents)
                ]
            
            # Aplicar chunking
            return chunker.sentence_wise_tokenized_chunk_documents(
                documents_dict, chunk_size=512
            )
            
        except Exception as e:
            raise DocumentProcessingError(f"Chunking failed: {str(e)}")
    
    def _save_chunks_to_file(self, chunks: list, chunks_path: Path) -> None:
        """Guarda los chunks en un archivo JSON"""
        try:
            with chunks_path.open("w", encoding="utf-8") as f:
                json.dump(chunks, f, ensure_ascii=False, indent=2)
        except Exception as e:
            raise DocumentProcessingError(f"Failed to save chunks: {str(e)}")
    
    async def process_document(self, file: UploadFile, comments: str) -> dict:
        """Procesa un documento de forma segura y robusta"""

        file_path, chunks_path = self._get_file_paths(file.filename)
        
        try:
            # 1. Verificar si ya existe y reutilizar
            if chunks_path.exists():
                index_chunks_from_file(str(chunks_path))
                await save_register(
                    str(file_path), str(chunks_path), comments, status="reused"
                )
                return {"status": "reused", "file": str(file_path)}
            
            # 2. Guardar archivo subido
            await self._save_uploaded_file(file, file_path)
            
            # 3. Procesar y chunkear documento
            chunked_documents = self._load_and_chunk_document(file_path)
            
            # 4. Guardar chunks
            self._save_chunks_to_file(chunked_documents, chunks_path)
            
            # 5. Indexar en vectorstore
            index_chunks_from_file(str(chunks_path))
            
            # 6. Registrar en MongoDB
            await save_register(
                str(file_path), str(chunks_path), comments, status="processed"
            )
            
            return {
                "status": "processed",
                "file": str(file_path),
                "chunks": len(chunked_documents)
            }
            
        except DocumentProcessingError as e:
            # Limpiar archivos temporales en caso de error
            if file_path.exists():
                file_path.unlink()
            if chunks_path.exists():
                chunks_path.unlink()
                
            raise HTTPException(
                status_code=400, 
                detail={
                    "code": "PROCESSING_ERROR",
                    "error": type(e).__name__,
                    "reason": str(e)
                }
            )
        except Exception as e:
            # Error inesperado
            if file_path.exists():
                file_path.unlink()
            if chunks_path.exists():
                chunks_path.unlink()
                
            raise HTTPException(
                status_code=500, 
                detail={
                    "code": "UNEXPECTED_ERROR",
                    "error": "Internal server error"
                }
            )

document_processor = DocumentProcessor()