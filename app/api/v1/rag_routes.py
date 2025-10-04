from fastapi import APIRouter, HTTPException, Query # type: ignore
from app.services.vectorstore.search import semantic_search
from app.services.rag.rag_pipeline import rag_query
from app.services.qwen.qwen import QwenService

router = APIRouter(prefix="", tags=["RAG"])

qwen = QwenService()


@router.get("/")
async def search(query: str = Query(..., description="Consulta semántica"), top_k: int = 3):
    try:
        results = semantic_search(query, top_k)
        return {"query": query, "results": results}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={"code": "SEARCH_ERROR", "error": str(type(e).__name__), "reason": str(e)}
        )
    
@router.post("/mini-llama")
async def rag_endpoint(query: str, model: str = "mistral"):
    try:
        result = rag_query(query, model_name=model, top_k=top_k)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={"code": "RAG_ERROR", "error": str(type(e).__name__), "reason": str(e)}
        )
    

@router.get("/qwen")
def ask(question: str):
    try:
        response = qwen.generate_with_retriever(question)
        return {"response": response}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={"code": "QUEN_ERROR", "error": str(type(e).__name__), "reason": str(e)}
        )