// API呼び出し用の共通クライアント
import axios from 'axios';

// 環境変数からAPIのベースURLを取得
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem('token');
    
    // トークンがある場合はAuthorizationヘッダーに追加
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 認証エラー（401）の場合はログアウト処理
    if (error.response && error.response.status === 401) {
      // ローカルストレージからトークンを削除
      localStorage.removeItem('token');
      
      // ログインページにリダイレクト
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
