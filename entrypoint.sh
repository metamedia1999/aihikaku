#!/bin/bash
set -e

# エラーハンドリング関数
handle_error() {
  local exit_code=$?
  echo "エラーが発生しました: コード $exit_code, 行 $1"
  # 子プロセスを終了
  if [ ! -z "$BACKEND_PID" ]; then
    echo "バックエンドプロセスを終了します..."
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [ ! -z "$NGINX_PID" ]; then
    echo "Nginxプロセスを終了します..."
    kill $NGINX_PID 2>/dev/null || true
  fi
  exit $exit_code
}

# エラーハンドリングのトラップを設定
trap 'handle_error $LINENO' ERR

# ログ出力関数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "AIひかくアプリケーションを起動しています..."

# バックエンドディレクトリに移動
cd /backend || { log "バックエンドディレクトリが見つかりません"; exit 1; }

# 環境変数ファイルの確認
if [ ! -f .env ]; then
  log "警告: .envファイルが見つかりません。.env.exampleからコピーします。"
  cp .env.example .env || { log "環境変数ファイルの作成に失敗しました"; exit 1; }
fi

# バックエンドの起動
log "FastAPIバックエンドを起動しています..."
uvicorn server:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# バックエンドの起動確認
log "バックエンドの起動を確認しています..."
for i in {1..30}; do
  if curl -s http://localhost:8001/api/health > /dev/null 2>&1; then
    log "バックエンドが正常に起動しました"
    break
  fi
  
  if [ $i -eq 30 ]; then
    log "バックエンドの起動に失敗しました"
    exit 1
  fi
  
  log "バックエンドの起動を待機しています... ($i/30)"
  sleep 1
done

# Nginxの起動
log "Nginxを起動しています..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# 終了シグナルのハンドリング
trap 'log "終了シグナルを受信しました"; kill $BACKEND_PID $NGINX_PID; exit 0' SIGTERM SIGINT

log "アプリケーションが正常に起動しました"

# プロセスの監視
while kill -0 $BACKEND_PID 2>/dev/null && kill -0 $NGINX_PID 2>/dev/null; do
  sleep 5
done

# いずれかのプロセスが終了した場合
if kill -0 $BACKEND_PID 2>/dev/null; then
  log "Nginxが停止しました。バックエンドを終了します..."
  kill $BACKEND_PID
else
  log "バックエンドが停止しました。Nginxを終了します..."
  kill $NGINX_PID 2>/dev/null || true
fi

log "アプリケーションが停止しました"
exit 1
