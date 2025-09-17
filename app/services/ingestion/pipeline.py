import os
import json
from pathlib import Path
from app.services.ingestion.loaders import load_file
from app.services.ingestion.chunker import chunk_text
from app.services.vectorstore.chroma_store import index_chunks_from_file
from app.services.ingestion.mongo_services import save_register

RAW_DATA_DIR = "data/raw"
PROCESSED_DIR = "data/processed"
CHUNKS_DIR = "data/chunks"


def ensure_dirs():
    Path(CHUNKS_DIR).mkdir(parents=True, exist_ok=True)


def process_document(path: str):
    """Procesa un documento: si ya existe en processed/chunks, no lo repite"""
    ensure_dirs()
    try:
    
        filename, _ = os.path.splitext(os.path.basename(path))
        processed_path = os.path.join(PROCESSED_DIR, filename + ".json")
        chunks_path = os.path.join(CHUNKS_DIR, filename + "_chunks.json")
        save_register(path, processed_path)

        # Si ya existe, lo reutiliza
        if os.path.exists(processed_path) and os.path.exists(chunks_path):
            with open(chunks_path, "r", encoding="utf-8") as f:
                chunks = json.load(f)

            index_chunks_from_file(chunks_path)

            return {"status": "skipped", "file": path}

        # Caso contrario, lo procesa
        text = load_file(path)

        # Guardar el texto completo en JSON en lugar de TXT
        with open(processed_path, "w", encoding="utf-8") as f:
            json.dump({"text": text}, f, ensure_ascii=False, indent=2)

        # Generar y guardar los chunks
        chunks = chunk_text(text)
        with open(chunks_path, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)


        index_chunks_from_file(chunks_path)

        return {"status": "processed", "file": path}
    except Exception as e:
        return {
            "code": "PROCESSING_ERROR",
            "error": str(type(e).__name__),
            "reason": str(e),
            "file": path
        }
