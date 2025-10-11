from pathlib import Path
from bson import ObjectId
from fastapi import APIRouter, Form, HTTPException, Query, UploadFile, File # type: ignore
import os
import shutil

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel


from app.services.ingestion.new_ingestion_way import document_processor
from app.services.ingestion.file_services import *
from datetime import datetime

from  app.models.api_models import *

from app.services.mongo.mongo_services import *

custom_encoders = {
    ObjectId: str,
    datetime: lambda v: v.isoformat(),
}

router = APIRouter(prefix="", tags=["Ingestion"])





@router.post("/ingest-file")
async def ingest_file(
    file: UploadFile = File(..., description="Documento a procesar"),
    comments: str = Form(..., description="Comentarios sobre el documento")
):
    """Sube un archivo y lo procesa"""
    
    # Validaciones 
    if not file.filename:
        return JSONResponse(
            status_code=400,
            content={"error": "Filename is required"}
        )
    
    try:
        
        result = await document_processor.process_document(file, comments)
        return JSONResponse(content=jsonable_encoder(result))
    
    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )

#------------------------------------------------------------------------------------------ 

@router.put("/files/{doc_id}")
async def edit_file(doc_id: str, updates: UpdateDocument):
    updated = await update_file(doc_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found or update failed")
    return {"message": "✅ Document updated", "document": updated}

#------------------------------------------------------------------------------------------ 

@router.delete("/files/{doc_id}")
async def remove_file(doc_id: str, path_original: str):
    result = await delete_document_service(doc_id, path_original)
    return result

#------------------------------------------------------------------------------------------ 


@router.get("/")
async def get_documents(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    filename: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    content_type: Optional[str] = Query(None)
):
    """
    Obtiene todos los documentos con filtros opcionales
    """
    try:
        if filename or status or content_type:
            # Búsqueda con filtros
            files = await mongo_document_service.search_files(
                filename=filename,
                status=status,
                content_type=content_type
            )
            # Aplicar paginación manual
            files = files[skip:skip + limit]
        else:
            # Obtención normal con paginación
            files = await mongo_document_service.get_all_files(limit=limit, skip=skip)
        
        return {
            "documents": files,
            "pagination": {
                "limit": limit,
                "skip": skip,
                "total": len(files)
            }
        }
    
    except DocumentProcessingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    

#---------------------------------------------------------------------------------------------------------------

@router.get("/{doc_id}")
async def get_document(doc_id: str):
    """
    Obtiene un documento específico por ID
    """
    try:
        document = await mongo_document_service.get_file_by_id(doc_id)
        return {"document": document}
    
    except DocumentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DocumentProcessingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.patch("/{doc_id}")
async def update_document(doc_id: str, updates: dict):
    """
    Actualiza un documento existente
    """
    try:
        # Validar campos permitidos para actualización
        allowed_fields = {"comments", "status", "filename"}
        update_data = {k: v for k, v in updates.items() if k in allowed_fields}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        result = await mongo_document_service.update_document(doc_id, update_data)
        return result
    
    except DocumentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DocumentProcessingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    """
    Elimina un documento completamente
    """
    try:
        # Primero obtener el documento para tener path_original
        document = await mongo_document_service.get_file_by_id(doc_id)
        path_original = document.get("path_original", "")
        
        if not path_original:
            raise DocumentProcessingError("Document path not found")
        
        result = await mongo_document_service.delete_document(doc_id, path_original)
        return result
    
    except DocumentNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DocumentProcessingError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")