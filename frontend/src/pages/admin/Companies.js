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
  Globe
} from '@phosphor-icons/react';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // URLクエリパラメータの処理
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const action = queryParams.get('action');
    
    if (action === 'new') {
      // TODO: 新規企業追加モーダルを表示
      console.log('新規企業追加');
    }
  }, [location]);

  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 企業一覧の取得
        const companiesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/companies`);
        if (!companiesResponse.ok) throw new Error('企業の取得に失敗しました');
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);
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
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.tagline && company.tagline.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // 企業削除処理
  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/companies/${selectedCompany.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_daiko_token')}`
        }
      });
      
      if (!response.ok) throw new Error('企業の削除に失敗しました');
      
      // 成功したら一覧から削除
      setCompanies(companies.filter(company => company.id !== selectedCompany.id));
      setShowDeleteModal(false);
      setSelectedCompany(null);
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
            <h1 className="text-2xl font-bold">企業管理</h1>
            
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
                新規企業
              </button>
            </div>
          </div>
          
          {/* 検索バー */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="企業名やタグラインで検索..."
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
          
          {/* 企業リスト */}
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">企業名</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">タグライン</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">設立年</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">本社所在地</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">Webサイト</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map(company => (
                        <tr key={company.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                {company.logo ? (
                                  <img 
                                    src={company.logo} 
                                    alt={company.name} 
                                    className="h-10 w-10 rounded-full object-cover" 
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                                    {company.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="font-medium">{company.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-neutral-600 line-clamp-2">
                              {company.tagline || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {company.founding_year || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {company.hq_location || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {company.url ? (
                              <a
                                href={company.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center"
                              >
                                <Globe size={16} className="mr-1" />
                                {company.url.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 20)}
                                {company.url.replace(/^https?:\/\//, '').length > 20 ? '...' : ''}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                className="text-primary hover:text-primary-dark"
                                title="編集"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="削除"
                              >
                                <Trash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-neutral-500">
                          {searchTerm ? '検索条件に一致する企業が見つかりません' : '企業が登録されていません'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {filteredCompanies.length > 0 && (
                <div className="px-6 py-4 bg-neutral-50">
                  <div className="text-neutral-500 text-sm">
                    全 {companies.length} 件中 {filteredCompanies.length} 件表示
                  </div>
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
            <h3 className="text-xl font-bold mb-4">企業の削除</h3>
            <p className="mb-6">
              <span className="font-medium">{selectedCompany?.name}</span> を削除してもよろしいですか？
              この操作は元に戻せません。また、この企業に関連するサービスも削除される可能性があります。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCompany(null);
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteCompany}
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

export default Companies;
