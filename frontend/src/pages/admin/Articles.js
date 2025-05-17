import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import { 
  Plus, 
  MagnifyingGlass, 
  Pencil, 
  Trash, 
  ArrowsClockwise,
  Eye,
  Calendar,
  Tag
} from '@phosphor-icons/react';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // URLクエリパラメータの処理
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const action = queryParams.get('action');
    
    if (action === 'new') {
      // TODO: 新規記事追加モーダルを表示
      console.log('新規記事追加');
    }
  }, [location]);

  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 記事一覧の取得
        const articlesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles`);
        if (!articlesResponse.ok) throw new Error('記事の取得に失敗しました');
        const articlesData = await articlesResponse.json();
        setArticles(articlesData);
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
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  
  // 記事削除処理
  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${selectedArticle.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_daiko_token')}`
        }
      });
      
      if (!response.ok) throw new Error('記事の削除に失敗しました');
      
      // 成功したら一覧から削除
      setArticles(articles.filter(article => article.id !== selectedArticle.id));
      setShowDeleteModal(false);
      setSelectedArticle(null);
    } catch (err) {
      console.error('削除エラー:', err);
      alert(`エラー: ${err.message}`);
    }
  };
  
  // リフレッシュ処理
  const handleRefresh = () => {
    navigate(0); // ページをリロード
  };

  // 日付フォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">記事管理</h1>
            
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
                新規記事
              </button>
            </div>
          </div>
          
          {/* 検索バー */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="タイトルや内容、タグで検索..."
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
          
          {/* 記事リスト */}
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
            <div className="grid grid-cols-1 gap-6">
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* 記事サムネイル */}
                      <div className="md:w-1/4 h-48 md:h-auto">
                        {article.cover_image ? (
                          <img
                            src={article.cover_image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                            <span className="text-neutral-400">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 記事情報 */}
                      <div className="p-6 md:w-3/4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-xl mb-2">{article.title}</h3>
                            <div className="flex items-center text-sm text-neutral-500 mb-3">
                              <Calendar size={16} className="mr-1" />
                              <span>{formatDate(article.published_at)}</span>
                              
                              {article.slug && (
                                <span className="ml-3 text-neutral-400">
                                  /{article.slug}
                                </span>
                              )}
                            </div>
                            
                            {/* タグ */}
                            {article.tags && article.tags.length > 0 && (
                              <div className="flex flex-wrap mb-4 gap-2">
                                {article.tags.map((tag, index) => (
                                  <div key={index} className="flex items-center text-xs bg-neutral-100 rounded-full px-3 py-1">
                                    <Tag size={12} className="mr-1 text-neutral-500" />
                                    <span>{tag}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* 記事本文の抜粋 */}
                            <p className="text-neutral-600 line-clamp-2 mb-4 text-sm">
                              {article.body.substring(0, 150)}...
                            </p>
                          </div>
                          
                          {/* 操作ボタン */}
                          <div className="flex space-x-2">
                            <Link
                              to={`/article/${article.slug}`}
                              target="_blank"
                              className="text-neutral-600 hover:text-neutral-900"
                              title="プレビュー"
                            >
                              <Eye size={20} />
                            </Link>
                            <button
                              className="text-primary hover:text-primary-dark"
                              title="編集"
                            >
                              <Pencil size={20} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedArticle(article);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-500 hover:text-red-700"
                              title="削除"
                            >
                              <Trash size={20} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-3 flex justify-end">
                          <Link
                            to={`/article/${article.slug}`}
                            target="_blank"
                            className="text-primary hover:underline text-sm"
                          >
                            記事を開く
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-xl font-bold mb-2">記事が見つかりません</h3>
                  <p className="text-neutral-600 mb-6">
                    {searchTerm ? '検索条件に一致する記事がありません。' : '記事が登録されていません。'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="btn btn-primary"
                    >
                      すべての記事を表示
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
            <h3 className="text-xl font-bold mb-4">記事の削除</h3>
            <p className="mb-6">
              <span className="font-medium">{selectedArticle?.title}</span> を削除してもよろしいですか？
              この操作は元に戻せません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedArticle(null);
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteArticle}
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

export default Articles;
