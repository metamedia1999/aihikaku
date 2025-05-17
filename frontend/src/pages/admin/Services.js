import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import { 
  Plus, 
  MagnifyingGlass, 
  Pencil, 
  Trash, 
  Star, 
  ArrowsClockwise,
  Eye
} from '@phosphor-icons/react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState({});
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // URLクエリパラメータの処理
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const action = queryParams.get('action');
    
    if (action === 'new') {
      // TODO: 新規サービス追加モーダルを表示
      console.log('新規サービス追加');
    }
  }, [location]);

  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // サービス一覧の取得
        const servicesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/services`);
        if (!servicesResponse.ok) throw new Error('サービスの取得に失敗しました');
        const servicesData = await servicesResponse.json();
        setServices(servicesData);
        
        // カテゴリー一覧の取得
        const categoriesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
        if (!categoriesResponse.ok) throw new Error('カテゴリーの取得に失敗しました');
        const categoriesData = await categoriesResponse.json();
        
        // カテゴリーIDをキーとしたマップを作成
        const categoryMap = {};
        categoriesData.forEach(category => {
          categoryMap[category.id] = category.name;
        });
        setCategories(categoryMap);
        
        // 企業一覧の取得
        const companiesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/companies`);
        if (!companiesResponse.ok) throw new Error('企業の取得に失敗しました');
        const companiesData = await companiesResponse.json();
        
        // 企業IDをキーとしたマップを作成
        const companyMap = {};
        companiesData.forEach(company => {
          companyMap[company.id] = company.name;
        });
        setCompanies(companyMap);
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
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.short_description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // サービス削除処理
  const handleDeleteService = async () => {
    if (!selectedService) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/services/${selectedService.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_daiko_token')}`
        }
      });
      
      if (!response.ok) throw new Error('サービスの削除に失敗しました');
      
      // 成功したら一覧から削除
      setServices(services.filter(service => service.id !== selectedService.id));
      setShowDeleteModal(false);
      setSelectedService(null);
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
            <h1 className="text-2xl font-bold">サービス管理</h1>
            
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
                新規サービス
              </button>
            </div>
          </div>
          
          {/* 検索バー */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="サービス名または説明で検索..."
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
          
          {/* サービスリスト */}
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
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">サービス名</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">カテゴリー</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">提供企業</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">評価</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">初期料金</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredServices.length > 0 ? (
                      filteredServices.map(service => (
                        <tr key={service.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4">
                            <div className="font-medium">{service.name}</div>
                            <div className="text-neutral-500 text-sm">{service.slug}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-neutral-100 px-2 py-1 rounded-full text-sm">
                              {categories[service.category_id] || '未分類'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {companies[service.vendor_id] || '不明'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Star size={16} weight="fill" className="text-yellow-400 mr-1" />
                              <span>{service.rating_overall.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {service.pricing_plan && service.pricing_plan.length > 0 ? (
                              <span>
                                {service.pricing_plan[0].price_jpy === 0 
                                  ? '無料' 
                                  : `${service.pricing_plan[0].price_jpy.toLocaleString()}円`}
                              </span>
                            ) : (
                              <span className="text-neutral-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Link
                                to={`/service/${service.slug}`}
                                target="_blank"
                                className="text-neutral-600 hover:text-neutral-900"
                                title="プレビュー"
                              >
                                <Eye size={18} />
                              </Link>
                              <button
                                className="text-primary hover:text-primary-dark"
                                title="編集"
                              >
                                <Pencil size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedService(service);
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
                          {searchTerm ? '検索条件に一致するサービスが見つかりません' : 'サービスが登録されていません'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {filteredServices.length > 0 && (
                <div className="px-6 py-4 bg-neutral-50">
                  <div className="text-neutral-500 text-sm">
                    全 {services.length} 件中 {filteredServices.length} 件表示
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
            <h3 className="text-xl font-bold mb-4">サービスの削除</h3>
            <p className="mb-6">
              <span className="font-medium">{selectedService?.name}</span> を削除してもよろしいですか？
              この操作は元に戻せません。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedService(null);
                }}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteService}
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

export default Services;
