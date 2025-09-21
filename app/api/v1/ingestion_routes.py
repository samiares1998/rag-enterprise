from pathlib import Path
from fastapi import APIRouter, Form, HTTPException, UploadFile, File
import os
import shutil

from openai import BaseModel
from app.services.ingestion.pipeline import *
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
async def ingest_file(file: UploadFile = File(...), 
                      comments: str = Form(...)):
    """Sube un archivo y lo procesa"""
    # Asegurar que exista el directorio
    Path(RAW_DATA_DIR).mkdir(parents=True, exist_ok=True)

    file_path = os.path.join(RAW_DATA_DIR, file.filename)

    # Guardar el archivo en data/raw
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = await process_document(file_path, comments)
    return JSONResponse(content=jsonable_encoder(result, custom_encoder=custom_encoders))


@router.post("/ingest-all")
async def ingest_all():
    """Procesa todos los archivos dentro de data/raw/"""
    
    Path(RAW_DATA_DIR).mkdir(parents=True, exist_ok=True)

    results = []
    for root, _, files in os.walk(RAW_DATA_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            results.append(await process_document(file_path))
    return {"documents": results}


@router.get("/files")
async def list_files():
    return await get_files()
    
class UpdateDocument(BaseModel):
    filename: str | None = None
    comments: str | None = None
    status: str | None = None

@router.put("/files/{doc_id}")
async def edit_file(doc_id: str, updates: UpdateDocument):
    updated = await update_file(doc_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found or update failed")
    return {"message": "✅ Document updated", "document": updated}


@router.delete("/files/{doc_id}")
async def remove_file(doc_id: str, path_original: str):
    result = await delete_document(doc_id, path_original)
    return result

