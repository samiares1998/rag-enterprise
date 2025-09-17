from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from pymongo.errors import PyMongoError
import os

# Conexión a Mongo
MONGO_URL = "mongodb://localhost:27017"

try:
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    db = client["file_uploader"]
    collection = db["files"]

    # Probar la conexión
    client.admin.command("ping")
    print("✅ Conectado a MongoDB")
except Exception as e:
    print(f"❌ Error al conectar a MongoDB: {e}")


async def save_register(file, file_path):
    try:
        print("guardando...")

        if hasattr(file, "filename"):
            filename = file.filename
            content_type = file.content_type
        else:
            filename = os.path.basename(file)
            content_type = "local-file"

        doc = {
            "filename": filename,
            "content_type": content_type,
            "upload_date": datetime.utcnow(),
            "path": file_path
        }

        result = await collection.insert_one(doc)

        # hacer una copia limpia (sin el ObjectId)
        saved_doc = {**doc, "id": str(result.inserted_id)}

        print(f"✅ guardado... {result.inserted_id}")
        return saved_doc

    except Exception as e:
        print(f"❌ Error al guardar en MongoDB: {e}")
        return None




async def get_files():
    files = []
    try:
        async for f in collection.find().sort("upload_date", -1).limit(20):
            f["_id"] = str(f["_id"])
            files.append(f)
    except PyMongoError as e:
        print(f"❌ Error al listar archivos: {e}")
    return files
