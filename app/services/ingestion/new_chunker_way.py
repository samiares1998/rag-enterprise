import uuid
import re
import os
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoTokenizer 

# Modelo local (descargado por HuggingFace)
LOCAL_MODEL = "BAAI/bge-small-en-v1.5"


class Chunker: 
    def __init__(self, tokenizer):
        self.tokenizer = tokenizer 
    
    def split_into_sentences(self, text):
        """Split text into sentences."""
        return re.split(r'(?<=[.!?])\s+', text)
 
    def sentence_wise_tokenized_chunk_documents(self, documents, chunk_size=512, overlap=20, min_chunk_size=50):
        chunked_documents = []

        for doc in documents:
            sentences = self.split_into_sentences(doc['text'])
            tokens = []
            sentence_boundaries = [0]

            # Tokenize all sentences and keep track of sentence boundaries
            for sentence in sentences:
                sentence_tokens = self.tokenizer.encode(sentence, add_special_tokens=True)
                tokens.extend(sentence_tokens)
                sentence_boundaries.append(len(tokens))

            # Create chunks
            chunk_start = 0
            while chunk_start < len(tokens):
                chunk_end = chunk_start + chunk_size

                # Find the last complete sentence that fits in the chunk
                sentence_end = next((i for i in sentence_boundaries if i > chunk_end), len(tokens))
                chunk_end = min(chunk_end, sentence_end)

                # Create the chunk
                chunk_tokens = tokens[chunk_start:chunk_end]

                if len(chunk_tokens) >= min_chunk_size:
                    chunk_doc = {
                        'id_': str(uuid.uuid4()),
                        'chunk': chunk_tokens,
                        'original_text': self.tokenizer.decode(chunk_tokens),
                        'chunk_index': len(chunked_documents),
                        'parent_id': doc['id_'],
                        'chunk_token_count': len(chunk_tokens)
                    }

                    for key, value in doc.items():
                        if key != 'text' and key not in chunk_doc:
                            chunk_doc[key] = value

                    chunked_documents.append(chunk_doc)

                # Move to the next chunk start, considering overlap
                chunk_start = max(chunk_start + chunk_size - overlap, chunk_end - overlap)

        return chunked_documents


# Inicializar tokenizer de HF
tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL)

# Inicializar modelo de embeddings (para cuando lo necesites en el RAG)
embedder = HuggingFaceEmbeddings(model_name=LOCAL_MODEL)

# Inicializar Chunker con el tokenizer
chunker = Chunker(tokenizer)
