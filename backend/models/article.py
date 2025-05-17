from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.base import BaseDBModel, generate_uuid

class Article(BaseDBModel):
    title: str
    slug: str
    body: str
    cover_image: str
    tags: List[str] = []
    published_at: Optional[datetime] = None

class ArticleCreate(BaseModel):
    title: str
    slug: str
    body: str
    cover_image: str
    tags: List[str] = []
    published_at: Optional[datetime] = None

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    body: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None
    published_at: Optional[datetime] = None
