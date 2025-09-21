import os
import json
from pathlib import Path
from app.services.ingestion.loaders import load_file
from app.services.ingestion.chunker import chunk_text
from app.services.vectorstore.chroma_store import index_chunks_from_file
from app.services.ingestion.mongo_services import save_register
from app.services.vectorstore.chroma_store import delete_chunks_from_file
from app.services.ingestion.mongo_services import delete_file

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
    
async def delete_document(doc_id: str, path_original: str):
    """
    Elimina un documento:
    - Archivo original en RAW_DATA_DIR
    - Archivo de chunks en CHUNKS_DIR
    - Embeddings en Chroma
    - Registro en Mongo
    """
    try:
        # 1. Rutas del archivo y sus chunks
        filename, _ = os.path.splitext(os.path.basename(path_original))
        raw_file_path = os.path.join(RAW_DATA_DIR+"/"+os.path.basename(path_original))
        chunks_path = os.path.join(CHUNKS_DIR, filename + "_chunks.json")

        # 4. Eliminar embeddings en Chroma
        try:
            delete_chunks_from_file(chunks_path)
            print(f"🗑️ Embeddings eliminados de Chroma para {chunks_path}")
        except Exception as e:
            print(f"⚠️ Error eliminando embeddings en Chroma: {e}")

         # 2. Eliminar archivo físico si existe
        if os.path.exists(raw_file_path):
            os.remove(raw_file_path)
            print(f"🗑️ Archivo eliminado: {raw_file_path}")
        else:
            print(f"⚠️ Archivo no encontrado: {raw_file_path}")

        # 3. Eliminar archivo de chunks
        if os.path.exists(chunks_path):
            os.remove(chunks_path)
            print(f"🗑️ Chunks eliminados: {chunks_path}")
        else:
            print(f"⚠️ Chunks no encontrados: {chunks_path}")


        # 5. Eliminar registro en Mongo
        result = await delete_file(doc_id)
        print(f"🗑️ Registro eliminado en Mongo para ID {doc_id}")

        return {"status": "deleted", "id": doc_id, "file": path_original, "mongo": result}

    except Exception as e:
        return {
            "status": "error",
            "id": doc_id,
            "file": path_original,
            "error": str(e),
        }
