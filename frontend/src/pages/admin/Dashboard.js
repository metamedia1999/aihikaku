import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Buildings, 
  ListBullets, 
  Article, 
  Star, 
  Users, 
  ArrowUp, 
  ArrowRight 
} from '@phosphor-icons/react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    services: 0,
    companies: 0,
    categories: 0,
    articles: 0
  });
  const [recentServices, setRecentServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // サービス数の取得
        const servicesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/services`);
        const servicesData = await servicesResponse.json();
        
        // カテゴリー数の取得
        const categoriesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
        const categoriesData = await categoriesResponse.json();
        
        // 企業数の取得
        const companiesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/companies`);
        const companiesData = await companiesResponse.json();
        
        // 記事数の取得
        const articlesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles`);
        const articlesData = await articlesResponse.json();
        
        // 統計情報の設定
        setStats({
          services: servicesData.length,
          companies: companiesData.length,
          categories: categoriesData.length,
          articles: articlesData.length
        });
        
        // 最新サービスの取得
        // 実際のAPIでは最新順にソートされたデータを取得すべき
        setRecentServices(servicesData.slice(0, 5));
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-neutral-500 text-sm">サービス数</p>
                      <h3 className="text-3xl font-bold mt-1">{stats.services}</h3>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Package size={24} className="text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <Link to="/admin/services" className="text-primary hover:underline flex items-center">
                      詳細を見る <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-neutral-500 text-sm">企業数</p>
                      <h3 className="text-3xl font-bold mt-1">{stats.companies}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Buildings size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <Link to="/admin/companies" className="text-primary hover:underline flex items-center">
                      詳細を見る <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-neutral-500 text-sm">カテゴリー数</p>
                      <h3 className="text-3xl font-bold mt-1">{stats.categories}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <ListBullets size={24} className="text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <Link to="/admin/categories" className="text-primary hover:underline flex items-center">
                      詳細を見る <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-neutral-500 text-sm">記事数</p>
                      <h3 className="text-3xl font-bold mt-1">{stats.articles}</h3>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Article size={24} className="text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    <Link to="/admin/articles" className="text-primary hover:underline flex items-center">
                      詳細を見る <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 最近追加されたサービス */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">最近追加されたサービス</h3>
                    <Link to="/admin/services" className="text-primary hover:underline text-sm">
                      すべて見る
                    </Link>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-neutral-500 border-b">
                          <th className="pb-3 font-medium">サービス名</th>
                          <th className="pb-3 font-medium">カテゴリー</th>
                          <th className="pb-3 font-medium">評価</th>
                          <th className="pb-3 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentServices.length > 0 ? (
                          recentServices.map(service => (
                            <tr key={service.id} className="border-b">
                              <td className="py-4">
                                <div className="font-medium">{service.name}</div>
                                <div className="text-neutral-500 text-sm">{service.slug}</div>
                              </td>
                              <td className="py-4">
                                <span className="bg-neutral-100 px-2 py-1 rounded-full text-sm">
                                  {service.category_id}
                                </span>
                              </td>
                              <td className="py-4">
                                <div className="flex items-center">
                                  <Star size={16} weight="fill" className="text-yellow-400 mr-1" />
                                  <span>{service.rating_overall.toFixed(1)}</span>
                                </div>
                              </td>
                              <td className="py-4">
                                <Link
                                  to={`/service/${service.slug}`}
                                  target="_blank"
                                  className="text-primary hover:underline text-sm"
                                >
                                  表示
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-6 text-center text-neutral-500">
                              サービスがありません
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* クイックアクション */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold mb-6">クイックアクション</h3>
                  
                  <div className="space-y-4">
                    <Link
                      to="/admin/services?action=new"
                      className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Package size={20} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">新規サービス追加</h4>
                          <p className="text-neutral-500 text-sm mt-1">
                            新しいAIサービスを登録します
                          </p>
                        </div>
                      </div>
                    </Link>
                    
                    <Link
                      to="/admin/companies?action=new"
                      className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <Buildings size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">新規企業追加</h4>
                          <p className="text-neutral-500 text-sm mt-1">
                            サービス提供企業を登録します
                          </p>
                        </div>
                      </div>
                    </Link>
                    
                    <Link
                      to="/admin/articles?action=new"
                      className="block p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <Article size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">新規記事作成</h4>
                          <p className="text-neutral-500 text-sm mt-1">
                            ブログ記事や特集を作成します
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
