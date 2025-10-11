from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.models.database_connection import DatabaseConnectionDTO, DatabaseConnectionResponse
from app.services.database.database_service import DatabaseConnectionService
from typing import List
from app.services.database.database_service import data_base_service
router = APIRouter(prefix="/api/databases", tags=["database-connections"])


@router.post("/save", response_model=DatabaseConnectionResponse)
async def save_database_connection(
    dto: DatabaseConnectionDTO
):
    """Guarda información de una conexión a base de datos"""
    try:
        # Opcional: Testear la conexión antes de guardar
        connection_ok = await data_base_service.test_connection(dto)
        if not connection_ok:
            raise HTTPException(
                status_code=400,
                detail="No se pudo establecer conexión con la base de datos. Verifique los parámetros."
            )
        
        # Guardar la conexión
        result = await data_base_service.save_database_connection(dto)
        return JSONResponse(
            status_code=201,
            content=jsonable_encoder(result)
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        print(f"❌ Error interno: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "details": str(e)}
        )

@router.get("/", response_model=List[DatabaseConnectionResponse])
async def get_all_database_connections(
):
    """Obtiene todas las conexiones guardadas"""
    try:
        connections = await data_base_service.get_all_connections()
        return connections
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{connection_id}")
async def delete_database_connection(
    connection_id: str,
):
    """Elimina (desactiva) una conexión de base de datos"""
    try:
        result = await data_base_service.get_collection().update_one(
            {"_id": connection_id},
            {"$set": {"is_active": False}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Conexión no encontrada")
        
        return {"message": "Conexión eliminada correctamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))