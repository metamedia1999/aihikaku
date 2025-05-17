from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from models.base import BaseDBModel, generate_uuid

# 価格プランのモデル
class PricingPlan(BaseModel):
    plan: str
    price_jpy: int
    billing_cycle: str

# Serviceモデル
class Service(BaseDBModel):
    name: str
    slug: str
    short_description: str
    long_description: str
    category_id: str
    pricing_plan: List[PricingPlan]
    vendor_id: str
    rating_overall: float = 0.0
    rating_uiux: float = 0.0
    rating_cost: float = 0.0
    rating_support: float = 0.0
    pros: List[str] = []
    cons: List[str] = []
    hero_image: str
    gallery_images: List[str] = []
    official_url: str

# Service作成用モデル
class ServiceCreate(BaseModel):
    name: str
    slug: str
    short_description: str
    long_description: str
    category_id: str
    pricing_plan: List[PricingPlan]
    vendor_id: str
    rating_overall: float = 0.0
    rating_uiux: float = 0.0
    rating_cost: float = 0.0
    rating_support: float = 0.0
    pros: List[str] = []
    cons: List[str] = []
    hero_image: str
    gallery_images: List[str] = []
    official_url: str

# Service更新用モデル
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    category_id: Optional[str] = None
    pricing_plan: Optional[List[PricingPlan]] = None
    vendor_id: Optional[str] = None
    rating_overall: Optional[float] = None
    rating_uiux: Optional[float] = None
    rating_cost: Optional[float] = None
    rating_support: Optional[float] = None
    pros: Optional[List[str]] = None
    cons: Optional[List[str]] = None
    hero_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    official_url: Optional[str] = None
