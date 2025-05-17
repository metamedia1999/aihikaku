import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // 入力検証
    if (!username.trim() || !password.trim()) {
      setError('ユーザー名とパスワードを入力してください');
      setLoading(false);
      return;
    }
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.message || 'ログインに失敗しました');
      }
    } catch (err) {
      console.error('ログインエラー:', err);
      setError('ログイン処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  return (
    <div className="min-h-screen bg-neutral flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">管理者ログイン</h1>
          <p className="text-neutral-600">AI代行.com管理パネルにアクセス</p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-neutral-700 font-medium mb-2">
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ユーザー名を入力"
              disabled={loading}
              autoComplete="username"
              required
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="password" className="block text-neutral-700 font-medium mb-2">
              パスワード
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="パスワードを入力"
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute right-0 top-0 mt-3 mr-4 text-neutral-500 hover:text-neutral-800"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeSlash size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <CircleNotch size={20} className="animate-spin mr-2" />
                ログイン中...
              </>
            ) : (
              'ログイン'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-neutral-600">
          <p>
           
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
