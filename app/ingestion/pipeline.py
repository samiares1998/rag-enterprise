import os
import json
from pathlib import Path
from app.ingestion.loaders import load_file
from app.ingestion.chunker import chunk_text

RAW_DATA_DIR = "data/raw"
PROCESSED_DIR = "data/processed"
CHUNKS_DIR = "data/chunks"


def ensure_dirs():
    Path(PROCESSED_DIR).mkdir(parents=True, exist_ok=True)
    Path(CHUNKS_DIR).mkdir(parents=True, exist_ok=True)


def process_document(path: str):
    """Procesa un documento: si ya existe en processed/chunks, no lo repite"""
    ensure_dirs()
    try:
        filename, _ = os.path.splitext(os.path.basename(path))
        processed_path = os.path.join(PROCESSED_DIR, filename + ".txt")
        chunks_path = os.path.join(CHUNKS_DIR, filename + "_chunks.json")

        # Si ya existe, lo reutiliza
        if os.path.exists(processed_path) and os.path.exists(chunks_path):
            with open(chunks_path, "r", encoding="utf-8") as f:
                chunks = json.load(f)
            return {"status": "skipped", "file": path}

        # Caso contrario, lo procesa
        text = load_file(path)

        with open(processed_path, "w", encoding="utf-8") as f:
            f.write(text)

        chunks = chunk_text(text)
        with open(chunks_path, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)

        return {"status": "processed", "file": path}
    except Exception as e:
        return {
            "code": "PROCESSING_ERROR",
            "error": str(type(e).__name__),
            "reason": str(e),
            "file": path
        }
