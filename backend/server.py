import os
import sys
import logging
import uuid
import json
import bcrypt
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Body, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.encoders import jsonable_encoder
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from jose import JWTError, jwt
from dotenv import load_dotenv

# モジュールパスの追加
ROOT_DIR = Path(__file__).parent
sys.path.append(str(ROOT_DIR))

# モデルのインポート
from models.base import BaseDBModel
from models.service import Service, ServiceCreate, ServiceUpdate, PricingPlan
from models.company import Company, CompanyCreate, CompanyUpdate
from models.category import Category, CategoryCreate, CategoryUpdate
from models.article import Article, ArticleCreate, ArticleUpdate
from models.review import Review, ReviewCreate, ReviewUpdate
from models.user import User, UserCreate, UserUpdate, UserLogin, UserRole, TokenData

# 環境変数の読み込み
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ロガーの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB接続
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
db_name = os.environ.get('DB_NAME', 'ai_hikaku_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# JWTトークン設定
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("環境変数 'SECRET_KEY' が設定されていません。")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1週間

# OAuth2スキーマ
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# メインアプリの作成
app = FastAPI(title="AI比較.com API")

# CORS設定
ALLOWED_ORIGINS_STRING = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_STRING.split(',')]

# 環境設定
APP_ENV = os.environ.get("APP_ENV", "development")

# APIルーターの作成
api_router = APIRouter(prefix="/api")

# トークン生成関数
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 現在のユーザーを取得する依存関数
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="認証情報が無効です",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    user = await db.users.find_one({"id": token_data.user_id})
    if user is None:
        raise credentials_exception
    return user

# 管理者ユーザーを取得する依存関数
async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者権限が必要です"
        )
    return current_user

# 編集者または管理者ユーザーを取得する依存関数
async def get_editor_or_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.EDITOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="編集者または管理者権限が必要です"
        )
    return current_user

# 初期ユーザーの作成関数
async def create_initial_user():
    users_collection = db.users
    admin_exists = await users_collection.find_one({"username": "rootaimeta"})
    if not admin_exists:
        # パスワードのハッシュ化
        password = os.environ.get("INITIAL_ADMIN_PASSWORD")
        if not password:
            logger.error("環境変数 'INITIAL_ADMIN_PASSWORD' が設定されていません。初期ユーザーは作成されませんでした。")
            return  # パスワードがなければ処理を中断

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # 管理者ユーザーの作成
        admin_user = {
            "id": str(uuid.uuid4()),
            "username": "rootaimeta",
            "email": "admin@aihikaku.com",  # メールアドレスも修正
            "password_hash": hashed_password.decode('utf-8'),
            "role": "admin",
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await users_collection.insert_one(admin_user)
        logger.info("初期管理者ユーザーが作成されました")

# 認証エンドポイント
@api_router.post("/auth/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"username": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザー名またはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # パスワードの検証
    if not bcrypt.checkpw(form_data.password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザー名またはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # アクセストークンの生成
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# サービス関連エンドポイント
@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find().to_list(1000)
    return services

@api_router.get("/services/{slug}", response_model=Service)
async def get_service(slug: str):
    service = await db.services.find_one({"slug": slug})
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"スラッグ '{slug}' を持つサービスが見つかりません"  # より具体的なメッセージ
        )
    return service

@api_router.post("/services", response_model=Service)
async def create_service(service: ServiceCreate, current_user: dict = Depends(get_admin_user)):
    service_dict = service.dict()
    service_dict["created_at"] = datetime.now(timezone.utc)
    service_dict["updated_at"] = datetime.now(timezone.utc)
    result = await db.services.insert_one(service_dict)
    created_service = await db.services.find_one({"_id": result.inserted_id})
    return created_service

@api_router.put("/services/{service_id}", response_model=Service)
async def update_service(service_id: str, service: ServiceUpdate, current_user: dict = Depends(get_admin_user)):
    service_dict = service.dict(exclude_unset=True)
    service_dict["updated_at"] = datetime.now(timezone.utc)
    
    existing_service = await db.services.find_one({"id": service_id})
    if not existing_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{service_id}' を持つサービスが見つかりません"
        )
    
    await db.services.update_one({"id": service_id}, {"$set": service_dict})
    updated_service = await db.services.find_one({"id": service_id})
    return updated_service

@api_router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: str, current_user: dict = Depends(get_admin_user)):
    existing_service = await db.services.find_one({"id": service_id})
    if not existing_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{service_id}' を持つサービスが見つかりません"
        )
    
    await db.services.delete_one({"id": service_id})
    return None

# カテゴリ関連エンドポイント
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find().to_list(1000)
    return categories

@api_router.get("/categories/{slug}", response_model=Category)
async def get_category(slug: str):
    category = await db.categories.find_one({"slug": slug})
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"スラッグ '{slug}' を持つカテゴリが見つかりません"
        )
    return category

@api_router.post("/categories", response_model=Category)
async def create_category(category: CategoryCreate, current_user: dict = Depends(get_admin_user)):
    category_dict = category.dict()
    category_dict["created_at"] = datetime.now(timezone.utc)
    category_dict["updated_at"] = datetime.now(timezone.utc)
    result = await db.categories.insert_one(category_dict)
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    return created_category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category: CategoryUpdate, current_user: dict = Depends(get_admin_user)):
    category_dict = category.dict(exclude_unset=True)
    category_dict["updated_at"] = datetime.now(timezone.utc)
    
    existing_category = await db.categories.find_one({"id": category_id})
    if not existing_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{category_id}' を持つカテゴリが見つかりません"
        )
    
    await db.categories.update_one({"id": category_id}, {"$set": category_dict})
    updated_category = await db.categories.find_one({"id": category_id})
    return updated_category

@api_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str, current_user: dict = Depends(get_admin_user)):
    existing_category = await db.categories.find_one({"id": category_id})
    if not existing_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{category_id}' を持つカテゴリが見つかりません"
        )
    
    await db.categories.delete_one({"id": category_id})
    return None

# 企業関連エンドポイント
@api_router.get("/companies", response_model=List[Company])
async def get_companies():
    companies = await db.companies.find().to_list(1000)
    return companies

@api_router.get("/companies/{slug}", response_model=Company)
async def get_company(slug: str):
    company = await db.companies.find_one({"slug": slug})
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"スラッグ '{slug}' を持つ企業が見つかりません"
        )
    return company

@api_router.post("/companies", response_model=Company)
async def create_company(company: CompanyCreate, current_user: dict = Depends(get_admin_user)):
    company_dict = company.dict()
    company_dict["created_at"] = datetime.now(timezone.utc)
    company_dict["updated_at"] = datetime.now(timezone.utc)
    result = await db.companies.insert_one(company_dict)
    created_company = await db.companies.find_one({"_id": result.inserted_id})
    return created_company

@api_router.put("/companies/{company_id}", response_model=Company)
async def update_company(company_id: str, company: CompanyUpdate, current_user: dict = Depends(get_admin_user)):
    company_dict = company.dict(exclude_unset=True)
    company_dict["updated_at"] = datetime.now(timezone.utc)
    
    existing_company = await db.companies.find_one({"id": company_id})
    if not existing_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{company_id}' を持つ企業が見つかりません"
        )
    
    await db.companies.update_one({"id": company_id}, {"$set": company_dict})
    updated_company = await db.companies.find_one({"id": company_id})
    return updated_company

@api_router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(company_id: str, current_user: dict = Depends(get_admin_user)):
    existing_company = await db.companies.find_one({"id": company_id})
    if not existing_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{company_id}' を持つ企業が見つかりません"
        )
    
    await db.companies.delete_one({"id": company_id})
    return None

# 記事関連エンドポイント
@api_router.get("/articles", response_model=List[Article])
async def get_articles():
    articles = await db.articles.find().to_list(1000)
    return articles

@api_router.get("/articles/{slug}", response_model=Article)
async def get_article(slug: str):
    article = await db.articles.find_one({"slug": slug})
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"スラッグ '{slug}' を持つ記事が見つかりません"
        )
    return article

@api_router.post("/articles", response_model=Article)
async def create_article(article: ArticleCreate, current_user: dict = Depends(get_editor_or_admin_user)):
    article_dict = article.dict()
    article_dict["created_at"] = datetime.now(timezone.utc)
    article_dict["updated_at"] = datetime.now(timezone.utc)
    result = await db.articles.insert_one(article_dict)
    created_article = await db.articles.find_one({"_id": result.inserted_id})
    return created_article

@api_router.put("/articles/{article_id}", response_model=Article)
async def update_article(article_id: str, article: ArticleUpdate, current_user: dict = Depends(get_editor_or_admin_user)):
    article_dict = article.dict(exclude_unset=True)
    article_dict["updated_at"] = datetime.now(timezone.utc)
    
    existing_article = await db.articles.find_one({"id": article_id})
    if not existing_article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{article_id}' を持つ記事が見つかりません"
        )
    
    await db.articles.update_one({"id": article_id}, {"$set": article_dict})
    updated_article = await db.articles.find_one({"id": article_id})
    return updated_article

@api_router.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(article_id: str, current_user: dict = Depends(get_editor_or_admin_user)):
    existing_article = await db.articles.find_one({"id": article_id})
    if not existing_article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{article_id}' を持つ記事が見つかりません"
        )
    
    await db.articles.delete_one({"id": article_id})
    return None

# レビュー関連エンドポイント
@api_router.get("/reviews", response_model=List[Review])
async def get_reviews(service_id: Optional[str] = None):
    if service_id:
        reviews = await db.reviews.find({"service_id": service_id}).to_list(1000)
    else:
        reviews = await db.reviews.find().to_list(1000)
    return reviews

@api_router.get("/reviews/{review_id}", response_model=Review)
async def get_review(review_id: str):
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{review_id}' を持つレビューが見つかりません"
        )
    return review

@api_router.post("/reviews", response_model=Review)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    # サービスの存在確認
    service = await db.services.find_one({"id": review.service_id})
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{review.service_id}' を持つサービスが見つかりません"
        )
    
    review_dict = review.dict()
    review_dict["user_id"] = current_user["id"]
    review_dict["created_at"] = datetime.now(timezone.utc)
    review_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.reviews.insert_one(review_dict)
    created_review = await db.reviews.find_one({"_id": result.inserted_id})
    
    # サービスの評価を更新
    await update_service_rating(review.service_id)
    
    return created_review

@api_router.put("/reviews/{review_id}", response_model=Review)
async def update_review(review_id: str, review: ReviewUpdate, current_user: dict = Depends(get_current_user)):
    existing_review = await db.reviews.find_one({"id": review_id})
    if not existing_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{review_id}' を持つレビューが見つかりません"
        )
    
    # 自分のレビューか管理者のみ編集可能
    if existing_review["user_id"] != current_user["id"] and current_user["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このレビューを編集する権限がありません"
        )
    
    review_dict = review.dict(exclude_unset=True)
    review_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.reviews.update_one({"id": review_id}, {"$set": review_dict})
    updated_review = await db.reviews.find_one({"id": review_id})
    
    # サービスの評価を更新
    await update_service_rating(existing_review["service_id"])
    
    return updated_review

@api_router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user)):
    existing_review = await db.reviews.find_one({"id": review_id})
    if not existing_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID '{review_id}' を持つレビューが見つかりません"
        )
    
    # 自分のレビューか管理者のみ削除可能
    if existing_review["user_id"] != current_user["id"] and current_user["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このレビューを削除する権限がありません"
        )
    
    service_id = existing_review["service_id"]
    await db.reviews.delete_one({"id": review_id})
    
    # サービスの評価を更新
    await update_service_rating(service_id)
    
    return None

# サービス評価更新関数（最適化版）
async def update_service_rating(service_id: str):
    # MongoDBの集計パイプラインを使用
    pipeline = [
        {"$match": {"service_id": service_id}},
        {"$group": {"_id": "$service_id", "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    
    if result:
        avg_rating = result[0]["avg_rating"]
        review_count = result[0]["count"]
        await db.services.update_one(
            {"id": service_id},
            {"$set": {"rating": avg_rating, "review_count": review_count, "updated_at": datetime.now(timezone.utc)}}
        )
    else:
        # レビューがない場合は0にリセット
        await db.services.update_one(
            {"id": service_id},
            {"$set": {"rating": 0, "review_count": 0, "updated_at": datetime.now(timezone.utc)}}
        )

# 検索エンドポイント
@api_router.get("/search")
async def search(q: str = "", filters: str = ""):
    query = {}
    
    # 検索キーワードがある場合
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"features": {"$regex": q, "$options": "i"}}
        ]
    
    # フィルターがある場合
    if filters:
        try:
            filters_dict = json.loads(filters)
            for key, value in filters_dict.items():
                if isinstance(value, list):
                    query[key] = {"$in": value}
                else:
                    query[key] = value
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"フィルターのパースに失敗しました。正しいJSON形式で指定してください。エラー: {str(e)}"
            )
    
    # サービスを検索
    services = await db.services.find(query).to_list(1000)
    return {"results": services, "count": len(services)}

# シードデータエンドポイント（開発環境のみ）
if APP_ENV != "production":
    @api_router.post("/seed", status_code=status.HTTP_201_CREATED)
    async def seed_data(current_user: dict = Depends(get_admin_user)):
        # カテゴリのシード
        categories = [
            {
                "id": str(uuid.uuid4()),
                "name": "AI アシスタント",
                "slug": "ai-assistant",
                "description": "日常業務や生活をサポートするAIアシスタントサービス",
                "icon": "assistant",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "name": "営業自動化",
                "slug": "sales-automation",
                "description": "営業プロセスを効率化するAIツール",
                "icon": "sales",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        
        # 既存のカテゴリを削除
        await db.categories.delete_many({})
        # 新しいカテゴリを挿入
        await db.categories.insert_many(categories)
        
        # 企業のシード
        companies = [
            {
                "id": str(uuid.uuid4()),
                "name": "OpenAI",
                "slug": "openai",
                "description": "AIの研究と開発を行う企業",
                "website": "https://openai.com",
                "logo": "openai.png",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        
        # 既存の企業を削除
        await db.companies.delete_many({})
        # 新しい企業を挿入
        await db.companies.insert_many(companies)
        
        # サービスのシード
        services = [
            {
                "id": str(uuid.uuid4()),
                "name": "ChatGPT Enterprise",
                "slug": "chatgpt-enterprise",
                "description": "企業向けのAIアシスタントサービス",
                "features": ["データプライバシー", "高度なセキュリティ", "カスタマイズ可能"],
                "category_id": categories[0]["id"],
                "company_id": companies[0]["id"],
                "pricing_plans": [
                    {
                        "name": "Enterprise",
                        "price": "契約ベース",
                        "features": ["無制限の利用", "専用サポート", "SLA保証"]
                    }
                ],
                "rating": 4.5,
                "review_count": 1,
                "image": "chatgpt-enterprise-hero.jpg",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        
        # 既存のサービスを削除
        await db.services.delete_many({})
        # 新しいサービスを挿入
        await db.services.insert_many(services)
        
        # レビューのシード
        reviews = [
            {
                "id": str(uuid.uuid4()),
                "service_id": services[0]["id"],
                "user_id": current_user["id"],
                "rating": 4.5,
                "title": "非常に便利",
                "content": "業務効率が大幅に向上しました。",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        ]
        
        # 既存のレビューを削除
        await db.reviews.delete_many({})
        # 新しいレビューを挿入
        await db.reviews.insert_many(reviews)
        
        return {"message": "シードデータが正常に作成されました"}

# 起動イベント
@app.on_event("startup")
async def startup_db_client():
    await create_initial_user()
    logger.info("サーバーが起動しました")

# シャットダウンイベント
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("データベース接続を閉じました")

# ルーターをアプリケーションに含める
app.include_router(api_router)

# CORSミドルウェアの追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
