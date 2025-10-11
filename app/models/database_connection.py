from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from enum import Enum

class DatabaseType(str, Enum):
    MONGODB = "mongodb"
    POSTGRESQL = "postgresql"
    MYSQL = "mysql"
    SQLITE = "sqlite"

class DatabaseConnectionDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Nombre de la conexión")
    database_type: DatabaseType
    host: str = Field(..., min_length=1, description="Host o URL de conexión")
    port: Optional[int] = Field(None, ge=1, le=65535, description="Puerto de conexión")
    database_name: str = Field(..., min_length=1, description="Nombre de la base de datos")
    username: Optional[str] = Field(None, description="Usuario (opcional para algunas DB)")
    password: Optional[str] = Field(None, description="Contraseña")
    description: Optional[str] = Field(None, max_length=200, description="Descripción opcional")
    
    @validator('port')
    def set_default_port(cls, v, values):
        if v is None:
            # Asignar puertos por defecto según el tipo de base de datos
            database_type = values.get('database_type')
            if database_type == DatabaseType.MONGODB:
                return 27017
            elif database_type == DatabaseType.POSTGRESQL:
                return 5432
            elif database_type == DatabaseType.MYSQL:
                return 3306
        return v

class DatabaseConnectionResponse(BaseModel):
    id: str
    name: str
    database_type: DatabaseType
    host: str
    port: int
    database_name: str
    username: Optional[str]
    description: Optional[str]
    created_at: str
    is_active: bool

    class Config:
        from_attributes = True