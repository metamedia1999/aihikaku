from pydantic import BaseModel, Field
from typing import Optional
from models.base import BaseDBModel, generate_uuid

class Category(BaseDBModel):
    name: str
    slug: str
    icon: str

class CategoryCreate(BaseModel):
    name: str
    slug: str
    icon: str

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    icon: Optional[str] = None
