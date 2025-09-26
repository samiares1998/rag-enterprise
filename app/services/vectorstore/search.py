from app.services.vectorstore.chroma_store import get_chroma

def semantic_search(query: str, top_k: int = 3):
    """Realiza búsqueda semántica en Chroma persistido."""
    db = get_chroma()
    results = db.similarity_search_with_relevance_scores(query, k=top_k)

    output = []
    for r in results:
        output.append({
            "chunk": r.page_content,
            "metadata": r.metadata
        })
    
    return output


  