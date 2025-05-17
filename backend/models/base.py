from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List

def generate_uuid():
    return str(uuid.uuid4())

class BaseDBModel(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
