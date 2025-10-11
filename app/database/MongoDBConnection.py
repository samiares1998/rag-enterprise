from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

class MongoDBClient:
    _instance = None
    _client: Optional[AsyncIOMotorClient] = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
        return cls._instance
    
    async def initialize(self, connection_string: str, database_name: str):
        """Inicializa la conexión (llamar una vez al inicio de la app)"""
        try:
            self._client = AsyncIOMotorClient(
                connection_string, 
                serverSelectionTimeoutMS=5000
            )
            self._db = self._client[database_name]
            
            await self._client.admin.command("ping")
            print(f" Conectado a MongoDB - Base de datos: {database_name}")
            
        except Exception as e:
            print(f" Error al conectar a MongoDB: {e}")
            raise
    
    def get_database(self):
        if self._db is None:
            raise Exception("No hay conexión establecida. Llama a connect() primero.")
        return self._db
    
    def get_collection(self, collection_name: str):
        print(f"conectar a get_database:")
        return self.get_database()[collection_name]
    
    async def close(self):
        if self._client:
            self._client.close()
            print(" Conexión a MongoDB cerrada")

# Instancia global
mongo_client = MongoDBClient()