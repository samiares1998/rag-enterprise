from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from pymongo.errors import PyMongoError
from bson import ObjectId
import os
from app.database.MongoDBConnection import mongo_client

async def save_register(file, chunks_path, comments=None, status="processed"):
    try:
        print("Guardando metadata en Mongo...")
        collection = mongo_client.get_collection("files")

        if hasattr(file, "filename"):  # Si viene como UploadFile
            filename = file.filename
            content_type = file.content_type
            original_path = os.path.join("raw", filename)
        else:  # Si viene como string (ruta)
            filename = os.path.basename(file)
            content_type = "local-file"
            original_path = file

        doc = {
            "filename": filename,
            "content_type": content_type,
            "upload_date": datetime.utcnow(),
            "path_original": original_path,
            "path_chunks": chunks_path,
            "comments": comments if comments else None,
            "status": status,
        }

        result = await collection.insert_one(doc)

        saved_doc = {**doc, "id": str(result.inserted_id)}

        print(f"✅ Guardado en Mongo con ID: {result.inserted_id}")
        return saved_doc

    except Exception as e:
        print(f"❌ Error al guardar en MongoDB: {e}")
        return None


async def get_files(limit: int = 20):
    files = []
    try:
        collection = mongo_client.get_collection("files")
      
        async for f in collection.find().sort("upload_date", -1).limit(limit):
            f["_id"] = str(f["_id"])
            files.append(f)
    except Exception as e:
        print(f"❌ Error al listar archivos: {e}")
    return files


# 🟢 Editar documento
async def update_file(doc_id: str, updates: dict):
    try:
        collection = mongo_client.get_collection("files")
        return await collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": updates}
        )


    except Exception as e:
        print(f"🔥 Error updating document: {str(e)}")
        return None
    
# 🛑 Eliminar documento por ID
async def delete_file(doc_id: str):
    try:
        collection = mongo_client.get_collection("files")
        return await collection.delete_one({"_id": ObjectId(doc_id)})

    except PyMongoError as e:
        print(f"❌ Error eliminando documento: {e}")
        return {"error": str(e)}


