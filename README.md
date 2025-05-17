# AIひかくプロジェクト

AIサービスの比較・レビューを提供するWebアプリケーションです。

## 機能

- AIサービスの検索と比較
- サービスのレビュー投稿と評価
- 記事の閲覧
- 管理者向け管理機能

## 技術スタック

- **バックエンド**: FastAPI, MongoDB
- **フロントエンド**: React, Tailwind CSS
- **インフラ**: Docker, Nginx

## 環境構築

### 必要条件

- Docker と Docker Compose
- Node.js 16以上
- Python 3.9以上
- Poetry (Pythonパッケージ管理)

### 開発環境のセットアップ

1. リポジトリをクローン:
   ```
   git clone https://github.com/your-org/aihikaku.git
   cd aihikaku
   ```

2. 環境変数の設定:
   ```
   # バックエンド
   cp backend/.env.example backend/.env
   # フロントエンド
   cp frontend/.env.example frontend/.env
   ```
   
   必要に応じて`.env`ファイルを編集してください。

3. Docker Composeで起動:
   ```
   docker-compose up -d
   ```

4. 開発サーバーにアクセス:
   - バックエンドAPI: http://localhost:8001/api
   - フロントエンド: http://localhost:3000

### 本番環境のデプロイ

1. 環境変数の設定:
   ```
   # バックエンド
   cp backend/.env.example backend/.env
   # 本番環境用の設定に編集
   ```

2. ビルドと起動:
   ```
   docker-compose -f docker-compose.prod.yml up -d
   ```

## プロジェクト構造

```
emergent_aihikaku/
├── .github/                      # GitHub Actions設定
├── .gitignore                    # Git除外設定
├── README.md                     # プロジェクト全体の説明
├── docker-compose.yml            # 開発環境用Docker設定
├── entrypoint.sh                 # アプリケーション起動スクリプト
├── nginx.conf                    # Nginxの設定
├── scripts/                      # 運用スクリプト
│   └── update-and-start.sh       # 更新・起動スクリプト
├── backend/                      # バックエンドアプリケーション
│   ├── .env.example              # 環境変数設定例
│   ├── requirements.txt          # Python依存関係
│   ├── server.py                 # メインアプリケーション
│   └── models/                   # データモデル定義
└── frontend/                     # フロントエンドアプリケーション
    ├── .env.example              # 環境変数設定例
    ├── package.json              # npm依存関係
    └── src/                      # ソースコード
```

## セキュリティ対策

- 環境変数による機密情報管理
- JWTベースの認証
- XSS対策（安全なマークダウンレンダリング）
- CORSセキュリティ設定
- セキュリティヘッダーの設定

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
