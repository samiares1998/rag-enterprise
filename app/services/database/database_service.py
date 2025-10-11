from app.models.database_connection import DatabaseConnectionDTO, DatabaseConnectionResponse
from app.database.MongoDBConnection import mongo_client
from datetime import datetime
from typing import List, Optional
import uuid

class DatabaseConnectionService:
    def __init__(self):
        self.collection_name = "database_connections"
    
    def get_collection(self):
        return mongo_client.get_collection(self.collection_name)
    
    async def save_database_connection(self, dto: DatabaseConnectionDTO) -> DatabaseConnectionResponse:
        """Guarda una nueva conexión de base de datos"""
        
        # Verificar si ya existe una conexión con el mismo nombre
        existing = await self.get_collection().find_one({"name": dto.name})
        if existing:
            raise ValueError(f"Ya existe una conexión con el nombre '{dto.name}'")
        
        # Crear documento para MongoDB
        connection_data = {
            "_id": str(uuid.uuid4()),
            "name": dto.name,
            "database_type": dto.database_type.value,
            "host": dto.host,
            "port": dto.port,
            "database_name": dto.database_name,
            "username": dto.username,
            # No guardamos la contraseña en texto plano (en producción usaríamos encriptación)
            "password": dto.password,  # ⚠️ En producción, encriptar esto
            "description": dto.description,
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
        
        # Insertar en MongoDB
        result = await self.get_collection().insert_one(connection_data)
        
        # Crear respuesta (excluyendo la contraseña)
        return DatabaseConnectionResponse(
            id=connection_data["_id"],
            name=connection_data["name"],
            database_type=dto.database_type,
            host=connection_data["host"],
            port=connection_data["port"],
            database_name=connection_data["database_name"],
            username=connection_data["username"],
            description=connection_data["description"],
            created_at=connection_data["created_at"],
            is_active=connection_data["is_active"]
        )
    
    async def test_connection(self, dto: DatabaseConnectionDTO) -> bool:
        """Testea la conexión a la base de datos"""
        try:
            if dto.database_type == "mongodb":
                from motor.motor_asyncio import AsyncIOMotorClient
                client = AsyncIOMotorClient(
                    f"mongodb://{dto.host}:{dto.port}",
                    serverSelectionTimeoutMS=5000
                )
                await client.admin.command('ping')
                client.close()
                return True
                
            # Aquí puedes agregar tests para otros tipos de bases de datos
            # elif dto.database_type == "postgresql":
            #     import asyncpg
            #     conn = await asyncpg.connect(...)
            #     await conn.close()
            
            return True
            
        except Exception as e:
            print(f"❌ Error testing connection: {e}")
            return False
    
    async def get_all_connections(self) -> List[DatabaseConnectionResponse]:
        """Obtiene todas las conexiones guardadas"""
        connections = []
        async for conn in self.get_collection().find({"is_active": True}):
            connections.append(DatabaseConnectionResponse(
                id=conn["_id"],
                name=conn["name"],
                database_type=conn["database_type"],
                host=conn["host"],
                port=conn["port"],
                database_name=conn["database_name"],
                username=conn.get("username"),
                description=conn.get("description"),
                created_at=conn["created_at"],
                is_active=conn["is_active"]
            ))
        return connections

data_base_service = DatabaseConnectionService()