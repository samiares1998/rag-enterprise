from langchain.chains import RetrievalQA
from langchain_community.llms import Ollama  # Si usas ollama local
from app.services.rag.retriever import get_retriever
from langchain_huggingface import HuggingFacePipeline

def build_rag_pipeline(model_name: str = "mistral", top_k: int = 3):
    """
    Construye el pipeline RAG:
    Retriever (Chroma) + LLM (local Ollama o remoto).
    """
    retriever = get_retriever(top_k=top_k)

    model = HuggingFacePipeline.from_model_id(
        model_id="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        task="text-generation",
        model_kwargs={
        "temperature": 0.4,
        "max_length": 512,
        "do_sample": True   
        }
    )

    qa_chain = RetrievalQA.from_chain_type(
        llm=model,
        retriever=retriever,
        chain_type="stuff",  # Mete los chunks como contexto
        return_source_documents=True
    )

    return qa_chain


def rag_query(query: str, model_name="mistral", top_k: int = 3):
    qa = build_rag_pipeline(model_name=model_name, top_k=top_k)
    response = qa.invoke(query)

    # Estructurar salida con respuesta + fuentes
    return {
        "query": query,
        "answer": response["result"],
        "sources": [
            {
                "chunk": doc.page_content[:200],
                "metadata": doc.metadata
            } for doc in response["source_documents"]
        ]
    }
