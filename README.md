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
