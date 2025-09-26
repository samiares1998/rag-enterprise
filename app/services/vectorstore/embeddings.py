from langchain_huggingface import HuggingFaceEmbeddings

# Modelo local (descargado por HuggingFace)
LOCAL_MODEL = "BAAI/bge-small-en-v1.5"

# Instancia global del modelo
emb_model = HuggingFaceEmbeddings(model_name=LOCAL_MODEL)


def get_embedding(text: str):
    """Genera embedding para un texto usando el modelo local."""
    return emb_model.embed_query(text)
