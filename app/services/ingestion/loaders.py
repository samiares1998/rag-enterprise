import fitz  # pymupdf
from PIL import Image
import pytesseract
import pandas as pd
import openpyxl
from docx import Document
import os


def load_file(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()

    loaders = {
        ".pdf": load_pdf,
        ".docx": load_docx,
        ".xlsx": load_excel,
        ".xls": load_excel,
        ".csv": load_csv,
        ".png": load_image,
        ".jpg": load_image,
        ".jpeg": load_image,
    }

    if ext not in loaders:
        raise ValueError(f"Formato no soportado: {ext}")
    return loaders[ext](path)


def load_pdf(path: str) -> str:
    text = ""
    doc = fitz.open(path)
    for page in doc:
        page_text = page.get_text()
        if page_text.strip():
            text += page_text
        else:
            # OCR para PDFs escaneados
            pix = page.get_pixmap()
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            text += pytesseract.image_to_string(img)
    return text


def load_docx(path: str) -> str:
    doc = Document(path)
    return "\n".join([para.text for para in doc.paragraphs])


def load_excel(path: str) -> str:
    df = pd.read_excel(path, sheet_name=None)  # todas las hojas
    return "\n".join([f"=== {sheet} ===\n{data.to_string()}" for sheet, data in df.items()])


def load_csv(path: str) -> str:
    df = pd.read_csv(path)
    return df.to_string()


def load_image(path: str) -> str:
    return pytesseract.image_to_string(Image.open(path))
