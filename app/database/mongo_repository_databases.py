from motor.motor_asyncio import AsyncIOMotorClient
from app.database.MongoDBConnection import mongo_client
from pymongo.errors import PyMongoError


async def get_databases(limit: int = 20):
    databases = []
    try:
        collection = mongo_client.get_collection("databases")
        async for f in collection.find().sort("upload_date", -1).limit(limit):
            f["_id"] = str(f["_id"])
            databases.append(f)
    except PyMongoError as e:
        print(f"❌ Error al listar databases: {e}")
    return databases