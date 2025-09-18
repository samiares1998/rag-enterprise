from fastapi import FastAPI, Request
from app.api.v1 import ingestion_routes
from app.api.v1 import rag_routes
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="RAG Enterprise - Ingestion API")

# Registrar endpoints
app.include_router(ingestion_routes.router, prefix="/api/v1/ingestion")

app.include_router(rag_routes.router, prefix="/api/v1/rag")

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