// 認証関連APIの一元化
import apiClient from './client';

// ログイン処理
export const login = async (username, password) => {
  try {
    // FormDataを使用してログインリクエストを送信
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // トークンをローカルストレージに保存
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  } catch (error) {
    console.error('ログインに失敗しました:', error);
    throw error;
  }
};

// ログアウト処理
export const logout = () => {
  // ローカルストレージからトークンを削除
  localStorage.removeItem('token');
};

// 現在のユーザー情報を取得
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('ユーザー情報の取得に失敗しました:', error);
    throw error;
  }
};

// 認証状態の確認
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
