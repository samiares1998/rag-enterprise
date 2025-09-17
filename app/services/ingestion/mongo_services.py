from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime



# Conexión a Mongo
MONGO_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URL)
db = client["file_uploader"]
collection = db["files"]


async def save_register(file,file_path):

    # Guardar metadatos en Mongo
    doc = {
        "filename": file.filename,
        "content_type": file.content_type,
        "upload_date": datetime.utcnow(),
        "path": file_path
    }
    result = await collection.insert_one(doc)

    return {"id": str(result.inserted_id), **doc}

async def list_files():
    files = []
    async for f in collection.find().sort("upload_date", -1).limit(20):
        f["_id"] = str(f["_id"])
        files.append(f)
    return files
