import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import { 
  Plus, 
  MagnifyingGlass, 
  Pencil, 
  Trash, 
  ArrowsClockwise,
  FolderOpen
} from '@phosphor-icons/react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // URLクエリパラメータの処理
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const action = queryParams.get('action');
    
    if (action === 'new') {
      // TODO: 新規カテゴリー追加モーダルを表示
      console.log('新規カテゴリー追加');
    }
  }, [location]);

  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // カテゴリー一覧の取得
        const categoriesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
        if (!categoriesResponse.ok) throw new Error('カテゴリーの取得に失敗しました');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // 検索処理
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // カテゴリー削除処理
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories/${selectedCategory.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_daiko_token')}`
        }
      });
      
      if (!response.ok) throw new Error('カテゴリーの削除に失敗しました');
      
      // 成功したら一覧から削除
      setCategories(categories.filter(category => category.id !== selectedCategory.id));
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('削除エラー:', err);
      alert(`エラー: ${err.message}`);
    }
  };
  
  // リフレッシュ処理
  const handleRefresh = () => {
    navigate(0); // ページをリロード
  };

  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">カテゴリー管理</h1>
            
            <div className="flex space-x-3">
              <button 
                onClick={handleRefresh}
                className="flex items-center text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-300 rounded-lg px-4 py-2"
              >
                <ArrowsClockwise size={20} className="mr-2" />
                更新
              </button>
              
              <button className="flex items-center bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2">
                <Plus size={20} className="mr-2" />
                新規カテゴリー
              </button>
            </div>
          </div>
          
          {/* 検索バー */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="カテゴリー名またはスラッグで検索..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              />
            </div>
          </div>
          
          {/* カテゴリーリスト */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <h3 className="text-red-800 font-medium">エラーが発生しました</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={handleRefresh} 
                className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                再読み込み
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 mr-4 bg-primary/10 rounded-lg flex items-center justify-center">
                            {category.icon ? (
                              <img
                                src={category.icon}
                                alt={category.name}
                                className="h-6 w-6 object-contain"
                              />
                            ) : (
                              <FolderOpen size={24} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{category.name}</h3>
                            <span className="text-sm text-neutral-500">/{category.slug}</span>
                          </div>
                        </div>
                        <div className="flex">
                          <button
                            className="text-primary hover:text-primary-dark p-1"
                            title="編集"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-500 hover:text-red-700 p-1 ml-2"
                            title="削除"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Link
                          to={`/search?category=${category.slug}`}
                          target="_blank"
                          className="text-sm text-primary hover:underline"
                        >
                          このカテゴリーのサービスを表示
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-5xl mb-4">📁</div>
                  <h3 className="text-xl font-bold mb-2">カテゴリーが見つかりません</h3>
                  <p className="text-neutral-600 mb-6">
                    {searchTerm ? '検索条件に一致するカテゴリーがありません。' : 'カテゴリーが登録されていません。'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="btn btn-primary"
                    >
                      すべてのカテゴリーを表示
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">カテゴリーの削除</h3>
            <p className="mb-6">
              <span className="font-medium">{selectedCategory?.name}</span> を削除してもよろしいですか？
              このカテゴリーを使用しているサービスのカテゴリーは未分類になります。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
