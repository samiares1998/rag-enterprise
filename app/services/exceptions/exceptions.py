from fastapi import HTTPException
from fastapi.responses import JSONResponse

class DocumentProcessingError(HTTPException):
    """Excepción base para errores de procesamiento de documentos"""
    def __init__(self, detail: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail=detail)

class DocumentNotFoundError(HTTPException):
    """Excepción al buscar un documento"""
    def __init__(self, detail: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail=detail)

class FileTooLargeError(DocumentProcessingError):
    def __init__(self, max_size_mb: int = 100):
        detail = f"File size exceeds maximum allowed ({max_size_mb}MB)"
        super().__init__(detail=detail, status_code=413)  # 413 Payload Too Large

class InvalidFileTypeError(DocumentProcessingError):
    def __init__(self, allowed_types: list):
        detail = f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        super().__init__(detail=detail, status_code=415)  # 415 Unsupported Media Type

class FileNotFoundError(DocumentProcessingError):
    def __init__(self, filename: str):
        detail = f"File not found: {filename}"
        super().__init__(detail=detail, status_code=404)

class ChunkingError(DocumentProcessingError):
    def __init__(self, reason: str):
        detail = f"Chunking failed: {reason}"
        super().__init__(detail=detail, status_code=422)  # 422 Unprocessable Entity