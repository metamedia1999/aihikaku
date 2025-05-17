from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from models.base import BaseDBModel, generate_uuid
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"

class User(BaseDBModel):
    username: str
    email: EmailStr
    password_hash: str
    role: UserRole = UserRole.EDITOR
    is_active: bool = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.EDITOR

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserLogin(BaseModel):
    username: str
    password: str

class TokenData(BaseModel):
    user_id: str
    username: str
    role: UserRole
    exp: datetime
