import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MagnifyingGlass, List, X } from '@phosphor-icons/react';

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  // カテゴリーの取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('カテゴリーの取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // 検索実行
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  // モバイルメニューの切り替え
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // ログアウト処理
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 管理画面かどうかの判定
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* ロゴ */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">AI代行<span className="text-neutral-800">.com</span></span>
            </Link>
          </div>

          {/* PC用ナビゲーション */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAdminPage ? (
              // 管理画面ナビゲーション
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg hover:bg-neutral-100 ${
                    location.pathname === '/admin' ? 'font-bold text-primary' : 'text-neutral-700'
                  }`}
                >
                  ダッシュボード
                </Link>
                <Link
                  to="/admin/services"
                  className={`px-3 py-2 rounded-lg hover:bg-neutral-100 ${
                    location.pathname === '/admin/services' ? 'font-bold text-primary' : 'text-neutral-700'
                  }`}
                >
                  サービス管理
                </Link>
                <Link
                  to="/admin/companies"
                  className={`px-3 py-2 rounded-lg hover:bg-neutral-100 ${
                    location.pathname === '/admin/companies' ? 'font-bold text-primary' : 'text-neutral-700'
                  }`}
                >
                  企業管理
                </Link>
                <Link
                  to="/admin/categories"
                  className={`px-3 py-2 rounded-lg hover:bg-neutral-100 ${
                    location.pathname === '/admin/categories' ? 'font-bold text-primary' : 'text-neutral-700'
                  }`}
                >
                  カテゴリー管理
                </Link>
                <Link
                  to="/admin/articles"
                  className={`px-3 py-2 rounded-lg hover:bg-neutral-100 ${
                    location.pathname === '/admin/articles' ? 'font-bold text-primary' : 'text-neutral-700'
                  }`}
                >
                  記事管理
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg ml-2"
                >
                  ログアウト
                </button>
              </>
            ) : (
              // 一般ユーザーナビゲーション
              <>
                <div className="relative group">
                  <button className="px-3 py-2 text-neutral-700 hover:text-primary flex items-center">
                    カテゴリー
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    {!loading && categories.length > 0 ? (
                      categories.map(category => (
                        <Link
                          key={category.id}
                          to={`/search?category=${category.slug}`}
                          className="block px-4 py-2 text-neutral-700 hover:bg-primary hover:text-white"
                        >
                          {category.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-neutral-500">読み込み中...</div>
                    )}
                  </div>
                </div>

                <Link to="/search" className="px-3 py-2 text-neutral-700 hover:text-primary">
                  サービス検索
                </Link>

                {isAuthenticated && (
                  <Link to="/admin" className="px-3 py-2 text-neutral-700 hover:text-primary">
                    管理画面
                  </Link>
                )}

                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="サービスを検索..."
                    className="pl-10 pr-4 py-2 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute left-0 top-0 mt-2 ml-3 text-neutral-500"
                  >
                    <MagnifyingGlass size={20} />
                  </button>
                </form>
              </>
            )}
          </nav>

          {/* モバイルメニューボタン */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-neutral-700 hover:text-primary focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <List size={24} />
              )}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-neutral-200">
            {isAdminPage ? (
              // 管理画面モバイルナビゲーション
              <div className="space-y-2 pb-3">
                <Link
                  to="/admin"
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ダッシュボード
                </Link>
                <Link
                  to="/admin/services"
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  サービス管理
                </Link>
                <Link
                  to="/admin/companies"
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  企業管理
                </Link>
                <Link
                  to="/admin/categories"
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  カテゴリー管理
                </Link>
                <Link
                  to="/admin/articles"
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  記事管理
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              // 一般ユーザーモバイルナビゲーション
              <>
                <form onSubmit={handleSearch} className="px-4 mb-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="サービスを検索..."
                      className="pl-10 pr-4 py-2 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute left-0 top-0 mt-2 ml-7 text-neutral-500"
                    >
                      <MagnifyingGlass size={20} />
                    </button>
                  </div>
                </form>

                <Link
                  to="/search"
                  className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  サービス検索
                </Link>

                <div className="px-4 py-2">
                  <div className="font-medium text-neutral-700 mb-2">カテゴリー</div>
                  <div className="space-y-1 ml-2">
                    {!loading && categories.length > 0 ? (
                      categories.map(category => (
                        <Link
                          key={category.id}
                          to={`/search?category=${category.slug}`}
                          className="block py-1 text-neutral-600 hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))
                    ) : (
                      <div className="text-neutral-500">読み込み中...</div>
                    )}
                  </div>
                </div>

                {isAuthenticated && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    管理画面
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
