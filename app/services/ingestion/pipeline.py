##Clase de prueba, primera forma de implemenmtar chunkers 

import os
import json
from pathlib import Path
from app.services.ingestion.loaders import load_file
from app.services.ingestion.chunker import chunk_text
from app.services.vectorstore.chroma_store import index_chunks_from_file
from app.services.mongo.mongo_services import save_register
from app.services.vectorstore.chroma_store import delete_chunks_from_file
from app.services.mongo.mongo_services import delete_file

RAW_DATA_DIR = "front/admin-dashboard/data/raw"
CHUNKS_DIR = "front/admin-dashboard/data/chunks"


def ensure_dirs():
    Path(CHUNKS_DIR).mkdir(parents=True, exist_ok=True)


async def process_document(path: str,comments: str):
    """Procesa un documento: guarda solo los chunks necesarios para reindexar"""
    ensure_dirs()
    try:
        filename, _ = os.path.splitext(os.path.basename(path))
        chunks_path = os.path.join(CHUNKS_DIR, filename + "_chunks.json")

        # Si ya existen los chunks, reutilizamos
        if os.path.exists(chunks_path):
            index_chunks_from_file(chunks_path)  # reindexar en Chroma
            return {"status": "skipped", "file": path}

        # Caso contrario, procesamos el archivo
        text = load_file(path)

        # Generar y guardar los chunks (único archivo necesario)
        chunks = chunk_text(text)
        with open(chunks_path, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)

        # Guardar en Chroma
        index_chunks_from_file(chunks_path)

        # Registrar en Mongo (en lugar de guardar processed.json)
        await save_register(path, chunks_path, comments, status="processed")


        return {"status": "processed", "file": path}

    except Exception as e:
        return {
            "code": "PROCESSING_ERROR",
            "error": str(type(e).__name__),
            "reason": str(e),
            "file": path,
        }
