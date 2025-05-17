import React, { createContext, useState, useContext, useEffect } from 'react';

// 認証コンテキストの作成
const AuthContext = createContext();

// AuthProvider コンポーネント
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 初期化時にローカルストレージからトークンを確認
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ai_daiko_token');
      
      if (token) {
        try {
          // トークンの検証（オプション）
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // トークンが無効な場合、ログアウト処理
            logout();
          }
        } catch (error) {
          console.error('認証確認エラー:', error);
          logout();
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // ログイン関数
  const login = async (username, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('ai_daiko_token', data.access_token);
        
        // ユーザー情報の取得
        const userResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true };
        }
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          message: errorData.detail || 'ログインに失敗しました。' 
        };
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      return { 
        success: false, 
        message: 'サーバーに接続できませんでした。' 
      };
    }
  };

  // ログアウト関数
  const logout = () => {
    localStorage.removeItem('ai_daiko_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // コンテキスト値
  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export const useAuth = () => {
  return useContext(AuthContext);
};
