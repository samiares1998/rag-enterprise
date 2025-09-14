# 🧠 RAG Enterprise Project

Proyecto base para construir un sistema **RAG (Retrieval-Augmented Generation)** en Python con FastAPI, LangChain y un vectorDB (Chroma, Pinecone o Qdrant).

## 🚀 Tech Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) + [LangChain](https://www.langchain.com/)  
- **VectorDB**: ChromaDB / Pinecone / Qdrant  
- **LLM**: OpenAI GPT / modelos open-source (HuggingFace, Llama, etc.)  
- **Infra**: Docker + GitHub Actions (CI/CD)  
- **Tests**: Pytest  

---

## 📂 Estructura de carpetas

```bash
rag-enterprise/
│── .github/                  # CI/CD workflows
│── docs/                     # Documentación
│── scripts/                  # Scripts auxiliares
│── tests/                    # Tests unitarios e integración
│
│── app/
│   │── main.py                # Entry point FastAPI
│   │── config.py              # Configuración global
│   │
│   ├── api/                   # Endpoints
│   │   └── v1/                # Versión de la API
│   │       ├── rag_routes.py
│   │       ├── health.py
│   │
│   ├── ingestion/             # Ingestión de datos
│   │   ├── loaders.py
│   │   ├── processors.py
│   │   └── embeddings.py
│   │
│   ├── retrieval/             # Recuperación de contexto
│   │   ├── vector_store.py
│   │   ├── retriever.py
│   │   └── ranker.py
│   │
│   ├── services/              # Lógica de negocio
│   │   ├── rag_service.py
│   │   └── llm_service.py
│   │
│   ├── models/                # Pydantic schemas & domain models
│   │   ├── request_models.py
│   │   ├── response_models.py
│   │   └── document.py
│   │
│   ├── utils/                 # Helpers
│   │   └── logging.py
│   │
│   └── __init__.py
│
│── frontend/                  # Opcional (React, Next.js, etc.)
│── requirements.txt
│── pyproject.toml             # (opcional con poetry/pipenv)
│── .env                       # Variables de entorno
│── README.md
# rag-enterprise

##  Estructura para la Data

rag-enterprise/
│── data/
│   ├── raw/           # Documentos originales (PDF, Word, Excel, CSV, imágenes)
│   │   ├── pdfs/
│   │   ├── word/
│   │   ├── excel/
│   │   ├── csv/
│   │   └── images/
│   │
│   ├── processed/     # Textos ya extraídos y normalizados
│   │   ├── ejemplo1.txt
│   │   ├── ejemplo2.txt
│   │
│   ├── chunks/        # Texto dividido en chunks (JSON, txt o parquet)
│   │   └── ejemplo1_chunks.json
│   │
│   └── embeddings/    # Vectores listos para subir al VectorDB (opcional si no usas DB directa)
│       └── ejemplo1.npy


Ingesta de documentos
✅ Objetivo

Procesar distintos formatos de documentos en texto plano, normalizarlos y dividirlos en chunks para preparar embeddings.

✅ Tareas completadas

Soporte de múltiples formatos:

PDFs → pymupdf o pypdf

Word → python-docx

Excel → openpyxl

CSV → pandas

Imágenes → OCR con pytesseract o easyocr

Pipeline de procesamiento:

Lee todos los archivos de data/raw/* automáticamente (sin especificar uno a uno).

Extrae texto y lo guarda en data/processed/.

Genera chunks con RecursiveCharacterTextSplitter y los guarda en data/chunks/.

Evita reprocesar: si ya existen .txt y .json, los reutiliza.

API REST con FastAPI:

POST /api/v1/ingestion/ingest-all → procesa todos los documentos.

POST /api/v1/ingestion/ingest-file → procesa un documento específico.

Error handling unificado:

Cada error responde con estructura estándar:

{
  "code": "PROCESSING_ERROR",
  "error": "FileNotFoundError",
  "reason": "No such file or directory"
}

