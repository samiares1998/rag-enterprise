from fastapi import APIRouter, HTTPException, Query
from app.services.vectorstore.search import semantic_search
from app.services.rag.rag_pipeline import rag_query

router = APIRouter(prefix="/api/v1/search", tags=["Search"])


@router.get("/")
async def search(query: str = Query(..., description="Consulta semántica"), top_k: int = 3):
    try:
        results = semantic_search(query, top_k)
        return {"query": query, "results": results}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "SEARCH_ERROR", "error": str(type(e).__name__), "reason": str(e)}
        )
    
@router.post("/")
async def rag_endpoint(query: str, model: str = "mistral", top_k: int = 3):
    try:
        result = rag_query(query, model_name=model, top_k=top_k)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"code": "RAG_ERROR", "error": str(type(e).__name__), "reason": str(e)}
        )