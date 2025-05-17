import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// レイアウトコンポーネント
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// ページコンポーネント
import HomePage from './pages/HomePage';
import ServiceDetail from './pages/ServiceDetail';
import SearchPage from './pages/SearchPage';
import ArticleDetail from './pages/ArticleDetail';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import AdminCompanies from './pages/admin/Companies';
import AdminCategories from './pages/admin/Categories';
import AdminArticles from './pages/admin/Articles';
import NotFound from './pages/NotFound';

// コンテキスト
import { AuthProvider } from './context/AuthContext';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // バックエンドの接続チェック
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
        if (response.ok) {
          console.log('バックエンド接続OK');
        } else {
          throw new Error(`バックエンドエラー: ${response.status}`);
        }
      } catch (err) {
        console.error('バックエンド接続エラー:', err);
        setError('APIサーバーに接続できません。しばらくしてからお試しください。');
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  // 管理者アクセス制限用のラッパーコンポーネント
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('ai_daiko_token');
    if (!token) {
      return <Navigate to="/admin/login" />;
    }
    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-neutral-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
          <p className="text-neutral-800">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 btn btn-primary"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/service/:slug" element={<ServiceDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
              <Route path="/admin/login" element={<LoginPage />} />
              
              {/* 管理者ルート */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/services" element={
                <ProtectedRoute>
                  <AdminServices />
                </ProtectedRoute>
              } />
              <Route path="/admin/companies" element={
                <ProtectedRoute>
                  <AdminCompanies />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute>
                  <AdminCategories />
                </ProtectedRoute>
              } />
              <Route path="/admin/articles" element={
                <ProtectedRoute>
                  <AdminArticles />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
