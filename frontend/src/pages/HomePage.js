import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceCard from '../components/service/ServiceCard';
import { MagnifyingGlass, Star, Lightning, Money, ArrowRight } from '@phosphor-icons/react';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // データのフェッチ
  useEffect(() => {
    const fetchData = async () => {
      try {
        // カテゴリーの取得
        const categoryResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
        if (!categoryResponse.ok) throw new Error('カテゴリーの取得に失敗しました');
        const categoryData = await categoryResponse.json();
        setCategories(categoryData);

        // トップサービスの取得（評価の高い順）
        const servicesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/services?min_rating=4&limit=10`);
        if (!servicesResponse.ok) throw new Error('サービスの取得に失敗しました');
        const servicesData = await servicesResponse.json();
        
        // サービスにカテゴリー名とベンダー名を追加
        const enhancedServices = await Promise.all(servicesData.map(async (service) => {
          // カテゴリー情報の取得
          let categoryName = '';
          const category = categoryData.find(cat => cat.id === service.category_id);
          if (category) {
            categoryName = category.name;
          }
          
          // ベンダー情報の取得
          let vendorName = '';
          try {
            const vendorResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/companies/${service.vendor_id}`);
            if (vendorResponse.ok) {
              const vendorData = await vendorResponse.json();
              vendorName = vendorData.name;
            }
          } catch (err) {
            console.error('ベンダー情報取得エラー:', err);
          }
          
          return {
            ...service,
            category_name: categoryName,
            vendor_name: vendorName
          };
        }));
        
        setTopServices(enhancedServices);

        // 最新記事の取得
        const articlesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles?limit=3`);
        if (!articlesResponse.ok) throw new Error('記事の取得に失敗しました');
        const articlesData = await articlesResponse.json();
        setLatestArticles(articlesData);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 検索実行
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-neutral-700">読み込み中...</p>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-lg mx-auto">
          <h3 className="text-red-800 font-medium">エラーが発生しました</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="hero-section">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            AI代行サービスを30秒で比較
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            業務自動化・効率化を実現するAIサービスの評判・料金・機能を徹底比較
          </p>
          
          {/* 検索フォーム */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="どんなAIサービスをお探しですか？（例：「資料作成」「営業支援」）"
              className="w-full py-4 px-6 pl-14 rounded-full text-neutral-800 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute left-0 top-0 ml-5 h-full flex items-center text-neutral-500"
            >
              <MagnifyingGlass size={24} />
            </button>
            <button
              type="submit"
              className="md:absolute md:right-0 md:top-0 md:mr-3 md:my-2 bg-primary hover:bg-primary-dark text-white rounded-full px-6 py-2 font-medium transition-colors duration-300 mt-4 md:mt-0 w-full md:w-auto"
            >
              無料で探す
            </button>
          </form>
        </div>
      </section>

      {/* 人気カテゴリーセクション */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">人気カテゴリー</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/search?category=${category.slug}`}
                className="bg-white rounded-xl shadow-md hover:shadow-lg p-4 flex flex-col items-center transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  {category.icon ? (
                    <img src={category.icon} alt={category.name} className="w-8 h-8" />
                  ) : (
                    <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                  )}
                </div>
                <h3 className="font-medium text-center">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 人気サービスセクション */}
      <section className="section bg-neutral">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">人気のAIサービス</h2>
            <Link to="/search" className="text-primary hover:underline flex items-center mt-2 md:mt-0">
              すべてのサービスを見る <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topServices.slice(0, 6).map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
            AI代行.comの特徴
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral p-6 rounded-xl text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-primary" weight="fill" />
              </div>
              <h3 className="text-xl font-bold mb-2">実際の評価</h3>
              <p className="text-neutral-700">
                実務での使用感やユーザー評価に基づいた信頼性の高いレビューを掲載
              </p>
            </div>
            
            <div className="bg-neutral p-6 rounded-xl text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lightning size={32} className="text-primary" weight="fill" />
              </div>
              <h3 className="text-xl font-bold mb-2">比較機能</h3>
              <p className="text-neutral-700">
                気になるサービスを並べて簡単に比較。最適なサービス選びをサポート
              </p>
            </div>
            
            <div className="bg-neutral p-6 rounded-xl text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Money size={32} className="text-primary" weight="fill" />
              </div>
              <h3 className="text-xl font-bold mb-2">料金透明性</h3>
              <p className="text-neutral-700">
                隠れコストやオプション料金まで含めた実質的なコスト情報を明示
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 最新記事セクション */}
      <section className="section bg-neutral">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">最新記事</h2>
            <Link to="/articles" className="text-primary hover:underline flex items-center mt-2 md:mt-0">
              すべての記事を見る <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestArticles.map(article => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 overflow-hidden">
                  {article.cover_image ? (
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                      <span className="text-neutral-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
                  <div className="flex flex-wrap mb-3">
                    {article.tags && article.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500">
                    {new Date(article.published_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="section bg-primary">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            あなたのビジネスに最適なAIサービスを見つけよう
          </h2>
          <p className="text-white text-lg mb-8 max-w-3xl mx-auto">
            業務効率化・自動化を実現するAIサービスの導入で、企業の競争力を高めませんか？
          </p>
          <Link
            to="/search"
            className="inline-block bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-neutral-100 transition-colors duration-300"
          >
            サービスを探す
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
