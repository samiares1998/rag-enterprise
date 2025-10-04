from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from pymongo.errors import PyMongoError
from bson import ObjectId
import os

# Conexión a Mongo
MONGO_URL = "mongodb://localhost:27017"

try:
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    db = client["file_uploader"]
    collection = db["files"]

    client.admin.command("ping")
    print(" Conectado a MongoDB")
except Exception as e:
    print(f" Error al conectar a MongoDB: {e}")


async def save_register(file, chunks_path, comments=None, status="processed"):
    try:
        print("Guardando metadata en Mongo...")

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
        async for f in collection.find().sort("upload_date", -1).limit(limit):
            f["_id"] = str(f["_id"])
            files.append(f)
    except PyMongoError as e:
        print(f"❌ Error al listar archivos: {e}")
    return files


# 🟢 Editar documento
async def update_file(doc_id: str, updates: dict):
    try:
        # ✅ Validar ID
        if not ObjectId.is_valid(doc_id):
            print("❌ Invalid document ID")
            return None

        # Convertir a dict si viene como modelo Pydantic
        if hasattr(updates, "dict"):
            update_data = {k: v for k, v in updates.dict().items() if v is not None}
        else:
            update_data = {k: v for k, v in updates.items() if v is not None}

        if not update_data:
            print("⚠️ No fields to update")
            return None

        update_data["updated_at"] = datetime.utcnow()

        result = await collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            print("❌ Document not found")
            return None

        updated_doc = await collection.find_one({"_id": ObjectId(doc_id)})
        updated_doc["_id"] = str(updated_doc["_id"])

        print(f"✅ Document updated: {updated_doc}")
        return {"message": "✅ Document updated", "document": updated_doc}

    except Exception as e:
        print(f"🔥 Error updating document: {str(e)}")
        return None
    
# 🛑 Eliminar documento por ID
async def delete_file(doc_id: str):
    try:
        # ✅ Validar que el ID sea correcto
        if not ObjectId.is_valid(doc_id):
            print("❌ ID inválido")
            return None

        result = await collection.delete_one({"_id": ObjectId(doc_id)})

        if result.deleted_count == 1:
            print(f"✅ Documento {doc_id} eliminado correctamente")
            return {"message": "Document deleted", "id": doc_id}
        else:
            print(f"⚠️ Documento {doc_id} no encontrado")
            return {"message": "Document not found", "id": doc_id}

    except PyMongoError as e:
        print(f"❌ Error eliminando documento: {e}")
        return {"error": str(e)}


