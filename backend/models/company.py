from pydantic import BaseModel, Field
from typing import Optional
from models.base import BaseDBModel, generate_uuid

class Company(BaseDBModel):
    name: str
    logo: str
    founding_year: Optional[int] = None
    hq_location: Optional[str] = None
    employee_count: Optional[int] = None
    url: Optional[str] = None
    tagline: Optional[str] = None

class CompanyCreate(BaseModel):
    name: str
    logo: str
    founding_year: Optional[int] = None
    hq_location: Optional[str] = None
    employee_count: Optional[int] = None
    url: Optional[str] = None
    tagline: Optional[str] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    founding_year: Optional[int] = None
    hq_location: Optional[str] = None
    employee_count: Optional[int] = None
    url: Optional[str] = None
    tagline: Optional[str] = None
