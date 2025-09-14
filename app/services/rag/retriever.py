from app.services.vectorstore.chroma_store import get_chroma

def get_retriever(top_k: int = 3):
    """Devuelve un retriever de Chroma"""
    db = get_chroma()
    retriever = db.as_retriever(search_kwargs={"k": top_k})
    return retriever
