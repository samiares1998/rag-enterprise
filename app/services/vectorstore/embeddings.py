from langchain_huggingface import HuggingFaceEmbeddings

# Modelo local (descargado por HuggingFace)
LOCAL_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Instancia global del modelo
emb_model = HuggingFaceEmbeddings(model_name=LOCAL_MODEL)


def get_embedding(text: str):
    """Genera embedding para un texto usando el modelo local."""
    return emb_model.embed_query(text)
