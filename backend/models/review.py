from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models.base import BaseDBModel, generate_uuid

class Review(BaseDBModel):
    service_id: str
    title: str
    body: str
    rating: float
    author_name: str
    author_role: str

class ReviewCreate(BaseModel):
    service_id: str
    title: str
    body: str
    rating: float
    author_name: str
    author_role: str

class ReviewUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    rating: Optional[float] = None
    author_name: Optional[str] = None
    author_role: Optional[str] = None
