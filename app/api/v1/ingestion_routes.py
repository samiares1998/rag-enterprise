from fastapi import APIRouter, UploadFile, File
import os
import shutil
from app.services.ingestion.pipeline import process_document, RAW_DATA_DIR
from fastapi.middleware.cors import CORSMiddleware
from app.services.ingestion.mongo_services import *
from fastapi.responses import JSONResponse

from bson import ObjectId
from datetime import datetime
from fastapi.encoders import jsonable_encoder


custom_encoders = {
    ObjectId: str,
    datetime: lambda v: v.isoformat(),
}
router = APIRouter()
# Configurar CORS para que React Admin pueda consumir la API


@router.post("/ingest-file")
async def ingest_file(file: UploadFile = File(...)):
    """Sube un archivo y lo procesa"""
    file_path = os.path.join(RAW_DATA_DIR, file.filename)

    # Guardar el archivo en data/raw
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = await process_document(file_path)
    return JSONResponse(content=jsonable_encoder(result, custom_encoder=custom_encoders))


@router.post("/ingest-all")
async def ingest_all():
    """Procesa todos los archivos dentro de data/raw/"""
    results = []
    for root, _, files in os.walk(RAW_DATA_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            results.append(await process_document(file_path))
    return {"documents": results}


@router.get("/files")
async def list_files():
    return await get_files()

