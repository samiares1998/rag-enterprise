from fastapi import FastAPI, Request

from app.controllers.api.v1 import rag_routes
from app.controllers.api.v1 import new_ingestion_routes
from app.controllers.api.v1 import data_bases_routes
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from  app.database.MongoDBConnection import mongo_client

app = FastAPI(title="RAG Enterprise - Ingestion API")

#BUSCAR SI SE PUEDE HACER ESTO DIFERENTE, NO ME GUSTA QUE QUEDE TODO EN EL MAIN
@app.on_event("startup")
async def startup_event():
    await mongo_client.initialize(
        connection_string="mongodb://localhost:27017",
        database_name="file_uploader"
    )

@app.on_event("shutdown")
async def shutdown_event():
    await mongo_client.close()


app.include_router(rag_routes.router, prefix="/api/v1/rag")

app.include_router(new_ingestion_routes.router, prefix="/api/v1/new_ingestion")


app.include_router(data_bases_routes.router, prefix="/api/v1/db")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 o ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚡ Handler global para cualquier excepción
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "error": type(exc).__name__,
            "reason": str(exc),
            "path": str(request.url)
        }
    )