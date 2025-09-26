from langchain.chains import RetrievalQA  # type: ignore
from app.services.vectorstore.retriever import get_retriever
from langchain_huggingface import HuggingFacePipeline  # type: ignore
from langchain.prompts import PromptTemplate
from app.services.vectorstore.search import semantic_search
import re

def build_rag_pipeline(model_name: str = "mistral", top_k: int = 3):
    model = HuggingFacePipeline.from_model_id(
        model_id="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        task="text-generation",
        model_kwargs={
            "temperature": 0.4,
            "max_length": 128,
            "do_sample": True
        }
    )

    QA_PROMPT = PromptTemplate(
        input_variables=["context", "question"],
        template="""Responde de forma breve y concisa a la siguiente pregunta.
    Usa solo la información del contexto.
    Si no sabes la respuesta, di 'No lo sé'.

    Contexto:
    {context}

    Pregunta: {question}

    Respuesta corta:"""
        )

    retriever = get_retriever(top_k=top_k)   

    qa_chain = RetrievalQA.from_chain_type(
        llm=model,
        retriever=retriever,
        chain_type="stuff",
        chain_type_kwargs={"prompt": QA_PROMPT},
        return_source_documents=True
    )

    return qa_chain



def rag_query(question: str, model_name="mistral", top_k: int = 3):
    qa = build_rag_pipeline(model_name=model_name, top_k=top_k)
    response = qa.invoke(question)

    raw_answer = response["result"]

    # 1️⃣ Extraer solo lo que venga después de "Respuesta corta:"
    match = re.search(r"Respuesta corta:\s*(.*)", raw_answer, re.DOTALL)
    if match:
        cleaned_answer = match.group(1).strip()
    else:
        # fallback si no encuentra el patrón
        cleaned_answer = raw_answer.strip()

    # 2️⃣ (opcional) quedarte solo con la primera frase
    if "." in cleaned_answer:
        cleaned_answer = cleaned_answer.split(".")[0] + "."

    return {
        "query": question,
        "answer": cleaned_answer,
        "sources": [
            {
                "chunk": doc.page_content[:200],
                "metadata": doc.metadata
            } for doc in response["source_documents"]
        ]
    }
