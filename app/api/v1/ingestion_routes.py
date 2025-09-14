from fastapi import APIRouter, UploadFile, File
import os
import shutil
from app.ingestion.pipeline import process_document, RAW_DATA_DIR

router = APIRouter()


@router.post("/ingest-file")
async def ingest_file(file: UploadFile = File(...)):
    """Sube un archivo y lo procesa"""
    file_path = os.path.join(RAW_DATA_DIR, file.filename)

    # Guardar el archivo en data/raw
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = process_document(file_path)
    return result


@router.post("/ingest-all")
async def ingest_all():
    """Procesa todos los archivos dentro de data/raw/"""
    results = []
    for root, _, files in os.walk(RAW_DATA_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            results.append(process_document(file_path))
    return {"documents": results}
