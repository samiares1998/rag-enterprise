from pydantic import BaseModel

class UpdateDocument(BaseModel):
    filename: str | None = None
    comments: str | None = None
    status: str | None = None