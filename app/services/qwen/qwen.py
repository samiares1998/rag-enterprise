from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from app.services.vectorstore.retriever import *

class QwenService:
    def __init__(self, model_name: str = "Qwen/Qwen2.5-3B-Instruct"):
        #print(f"🔄 Cargando modelo {model_name} ...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,   # usar media precisión en M3
            device_map="auto"           # auto: usa Metal/GPU si está disponible
        )
        #print(" Modelo cargado correctamente.")

    def generate_text(self, prompt: str, max_new_tokens: int = 512) -> str:
        # Preparar input
        messages = [{"role": "user", "content": prompt}]
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.model.device)

        # Generar texto
        generated_ids = self.model.generate(
            **model_inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
        )

        output_ids = generated_ids[0][len(model_inputs.input_ids[0]):]
        content = self.tokenizer.decode(output_ids, skip_special_tokens=True).strip()

        return content
    

    def generate_with_retriever(self, query: str, top_k: int = 3, max_new_tokens: int = 512, return_sources: bool = False):
        # 1. Construir el retriever
        retriever = get_retriever(top_k=top_k)

        # 2. Recuperar documentos
        docs = retriever.get_relevant_documents(query)

        #print(f" DOCS {docs} ...")

        # 3. Construir el contexto con los documentos recuperados
        context = "\n\n".join([doc.page_content for doc in docs])

        # 4. Prompt estilo "stuffing"
        prompt = f"""
        Usa el siguiente contexto para responder la pregunta.
        Si no está en el contexto, di que no lo sabes.

        Contexto:
        {context}

        Pregunta:
        {query}

        Respuesta:
        """

        # 5. Generar respuesta con Qwen
        answer = self.generate_text(prompt, max_new_tokens=max_new_tokens)

        if return_sources:
            return {
                "answer": answer,
                "sources": [doc.metadata for doc in docs]
            }
        return answer
