import os
import json
import logging
import chromadb
from langchain_community.vectorstores import Chroma
from langchain.docstore.document import Document
from app.services.vectorstore.embeddings import emb_model

# Persistencia local
CHROMA_PATH = "data/embeddings"
COLLECTION_NAME = "rag_docs"
# Configuración básica del logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]  # Se puede añadir FileHandler si quieres logs en archivo
)
logger = logging.getLogger(__name__)

def get_chroma():
    """Devuelve la colección persistida de Chroma."""
    return Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=emb_model,
        collection_name=COLLECTION_NAME
    )


def index_chunks_from_file(chunks_path: str):
    """
    Lee un archivo JSON con chunks y los indexa en Chroma,
    sin duplicar lo ya existente.
    """
    if not os.path.exists(chunks_path):
        logger.error(f"❌ No existe el archivo: {chunks_path}")
        raise FileNotFoundError(f"No existe el archivo: {chunks_path}")

    logger.info(f"📂 Cargando chunks desde {chunks_path}")

    with open(chunks_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    db = get_chroma()

    # Obtener IDs ya indexados
    existing = db.get(include=[])
    existing_ids = set(existing["ids"]) if existing["ids"] else set()

    # Crear documentos nuevos
    new_docs = []
    new_ids = []
    for i, chunk in enumerate(chunks):
        chunk_id = f"{os.path.basename(chunks_path)}_{i}"
        if chunk_id not in existing_ids:
            new_docs.append(Document(
                page_content=chunk,
                metadata={"source": chunks_path, "chunk_index": i}
            ))
            new_ids.append(chunk_id)

    if new_docs:
        db.add_documents(new_docs, ids=new_ids)
        db.persist()
        logger.info(f"✅ Añadidos {len(new_docs)} chunks nuevos desde {chunks_path}")
    else:
        logger.warning(f"⚡ No había chunks nuevos en {chunks_path}")

    return db


def index_all_chunks(chunks_dir="data/chunks"):
    """Recorre todos los JSON en data/chunks/ y los indexa."""
    for file in os.listdir(chunks_dir):
        if file.endswith(".json"):
            path = os.path.join(chunks_dir, file)
            index_chunks_from_file(path)
