#!/bin/bash
# AIひかくアプリケーション更新・起動スクリプト

# エラーハンドリング設定
set -e
trap 'echo "エラーが発生しました: $? at line $LINENO"; exit 1' ERR

# ログ出力関数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# コマンド存在確認関数
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# ポート使用プロセス終了関数
kill_process_on_port() {
  local port=$1
  log "ポート $port のプロセスを確認しています..."
  local pid=$(netstat -tulpn 2>/dev/null | grep ":$port" | awk '{print $7}' | cut -d'/' -f1)
  if [ ! -z "$pid" ]; then
    log "ポート $port のプロセス $pid を終了します"
    kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
    sleep 2
    log "プロセスを終了しました"
  else
    log "ポート $port で実行中のプロセスはありません"
  fi
}

# ログ表示関数
show_logs() {
  local service=$1
  local lines=${2:-10}
  
  log "=== $service の最新 $lines 行のログ ==="
  
  local log_file="/var/log/supervisor/$service.out.log"
  if [ -f "$log_file" ]; then
    echo "--- 標準出力 ---"
    tail -n $lines "$log_file"
  else
    echo "ログファイルが見つかりません: $log_file"
  fi
  
  local err_file="/var/log/supervisor/$service.err.log"
  if [ -f "$err_file" ]; then
    echo "--- 標準エラー ---"
    tail -n $lines "$err_file"
  else
    echo "エラーログファイルが見つかりません: $err_file"
  fi
  
  echo "========================================"
}

# メイン処理開始
log "依存関係のインストールとサービス更新を開始します..."

# サービス停止
log "開発サービスを停止しています..."
if command_exists supervisorctl; then
  supervisorctl stop backend || log "バックエンド停止中にエラーが発生しました（既に停止している可能性があります）"
  supervisorctl stop frontend || log "フロントエンド停止中にエラーが発生しました（既に停止している可能性があります）"
  # プロセス終了待機
  sleep 2
else
  log "エラー: Supervisorがインストールされていません"
  exit 1
fi

# 使用中ポートのプロセス終了
kill_process_on_port 3000  # フロントエンド
kill_process_on_port 8001  # バックエンド

# バックエンド依存関係インストール
log "バックエンド依存関係をインストールしています..."
cd /app/backend || { log "バックエンドディレクトリが見つかりません"; exit 1; }

if command_exists poetry; then
  log "Poetry依存関係を更新しています..."
  poetry lock
  poetry install --no-root
else
  log "エラー: Poetryがインストールされていません"
  exit 1
fi

# フロントエンド依存関係インストール
log "フロントエンド依存関係をインストールしています..."
cd /app/frontend || { log "フロントエンドディレクトリが見つかりません"; exit 1; }

if command_exists yarn; then
  log "Yarn依存関係を更新しています..."
  yarn install
else
  log "エラー: Yarnがインストールされていません"
  exit 1
fi

# サービス起動
log "開発サービスを起動しています..."
if command_exists supervisorctl; then
  supervisorctl start backend
  supervisorctl start frontend
else
  log "エラー: Supervisorがインストールされていません"
  exit 1
fi

# サービス起動待機
log "サービスの起動を待機しています..."
sleep 5

# ログ表示
show_logs "backend" 15
show_logs "frontend" 15

# ヘルスチェック
log "サービスのヘルスチェックを実行しています..."
if curl -s http://localhost:8001/api/health > /dev/null 2>&1; then
  log "バックエンドは正常に動作しています"
else
  log "警告: バックエンドのヘルスチェックに失敗しました"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
  log "フロントエンドは正常に動作しています"
else
  log "警告: フロントエンドのヘルスチェックに失敗しました"
fi

log "更新と再起動が完了しました！"
