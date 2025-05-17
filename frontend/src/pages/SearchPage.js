import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ServiceCard from '../components/service/ServiceCard';
import { MagnifyingGlass, Funnel, X, CircleNotch } from '@phosphor-icons/react';

const SearchPage = () => {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    q: '',
    category: '',
    min_rating: '',
    price_range: ''
  });
  const [totalResults, setTotalResults] = useState(0);

  // URLからクエリパラメータを取得して検索条件に設定
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    setSearchParams({
      q: queryParams.get('q') || '',
      category: queryParams.get('category') || '',
      min_rating: queryParams.get('min_rating') || '',
      price_range: queryParams.get('price_range') || ''
    });
  }, [location.search]);

  // 検索条件に基づいてサービスを取得
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        // カテゴリー情報の取得
        const categoryResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
        if (!categoryResponse.ok) throw new Error('カテゴリーの取得に失敗しました');
        const categoryData = await categoryResponse.json();
        setCategories(categoryData);

        // フィルター条件の構築
        const filters = {};
        if (searchParams.category) {
          const selectedCategory = categoryData.find(cat => cat.slug === searchParams.category);
          if (selectedCategory) {
            filters.category_id = selectedCategory.id;
          }
        }
        if (searchParams.min_rating) {
          filters.min_rating = parseFloat(searchParams.min_rating);
        }
        if (searchParams.price_range) {
          filters.price_range = searchParams.price_range;
        }

        // 検索APIの呼び出し
        const url = new URL(`${process.env.REACT_APP_BACKEND_URL}/api/search`);
        url.searchParams.append('q', searchParams.q || '');
        
        if (Object.keys(filters).length > 0) {
          url.searchParams.append('filters', JSON.stringify(filters));
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('サービスの検索に失敗しました');
        const data = await response.json();
        
        // サービスにカテゴリー名とベンダー名を追加
        const enhancedServices = await Promise.all(data.results.map(async (service) => {
          // カテゴリー情報の設定
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
        
        setServices(enhancedServices);
        setTotalResults(data.total);
      } catch (err) {
        console.error('検索エラー:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchParams]);

  // 検索フォーム送信時の処理
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('query');
    
    // 現在のURLパラメータを維持しつつ検索クエリを更新
    const queryParams = new URLSearchParams(location.search);
    if (query) {
      queryParams.set('q', query);
    } else {
      queryParams.delete('q');
    }
    
    // URLを更新して再検索
    window.history.pushState({}, '', `${location.pathname}?${queryParams.toString()}`);
    setSearchParams(prev => ({ ...prev, q: query }));
  };

  // フィルター変更時の処理
  const handleFilterChange = (filterType, value) => {
    // 現在のURLパラメータを取得
    const queryParams = new URLSearchParams(location.search);
    
    // パラメータを更新
    if (value) {
      queryParams.set(filterType, value);
    } else {
      queryParams.delete(filterType);
    }
    
    // URLを更新して再検索
    window.history.pushState({}, '', `${location.pathname}?${queryParams.toString()}`);
    setSearchParams(prev => ({ ...prev, [filterType]: value }));
  };

  // すべてのフィルターをクリア
  const clearAllFilters = () => {
    const queryParams = new URLSearchParams();
    if (searchParams.q) {
      queryParams.set('q', searchParams.q);
    }
    
    window.history.pushState({}, '', `${location.pathname}?${queryParams.toString()}`);
    setSearchParams({
      q: searchParams.q,
      category: '',
      min_rating: '',
      price_range: ''
    });
  };

  // フィルターバッジの生成
  const renderFilterBadges = () => {
    const badges = [];
    
    // カテゴリーフィルターのバッジ
    if (searchParams.category) {
      const categoryName = categories.find(cat => cat.slug === searchParams.category)?.name || searchParams.category;
      badges.push(
        <div key="category" className="inline-flex items-center bg-primary-light text-white rounded-full px-3 py-1 text-sm mr-2 mb-2">
          <span className="mr-1">カテゴリー: {categoryName}</span>
          <button
            onClick={() => handleFilterChange('category', '')}
            className="ml-1 focus:outline-none"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      );
    }
    
    // 評価フィルターのバッジ
    if (searchParams.min_rating) {
      badges.push(
        <div key="rating" className="inline-flex items-center bg-primary-light text-white rounded-full px-3 py-1 text-sm mr-2 mb-2">
          <span className="mr-1">評価: {searchParams.min_rating}以上</span>
          <button
            onClick={() => handleFilterChange('min_rating', '')}
            className="ml-1 focus:outline-none"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      );
    }
    
    // 価格帯フィルターのバッジ
    if (searchParams.price_range) {
      const priceRangeLabels = {
        'free': '無料',
        'low': '1万円未満',
        'medium': '1-5万円',
        'high': '5万円以上'
      };
      badges.push(
        <div key="price" className="inline-flex items-center bg-primary-light text-white rounded-full px-3 py-1 text-sm mr-2 mb-2">
          <span className="mr-1">価格帯: {priceRangeLabels[searchParams.price_range]}</span>
          <button
            onClick={() => handleFilterChange('price_range', '')}
            className="ml-1 focus:outline-none"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      );
    }
    
    return badges;
  };

  // 検索クエリとアクティブなフィルターの数をカウント
  const activeFiltersCount = 
    (searchParams.category ? 1 : 0) + 
    (searchParams.min_rating ? 1 : 0) + 
    (searchParams.price_range ? 1 : 0);

  return (
    <div className="bg-neutral min-h-screen">
      <div className="bg-white shadow-md py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">サービス検索</h1>
          
          {/* 検索フォーム */}
          <form onSubmit={handleSearch} className="max-w-2xl flex">
            <div className="relative flex-grow">
              <input
                type="text"
                name="query"
                placeholder="キーワードを入力（例：「資料作成」「議事録」）"
                className="w-full py-2 px-4 pl-10 border border-neutral-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
                defaultValue={searchParams.q}
              />
              <div className="absolute left-0 top-0 mt-2 ml-3 text-neutral-500">
                <MagnifyingGlass size={20} />
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2 rounded-r-lg transition-colors duration-300"
            >
              検索
            </button>
          </form>
          
          {/* フィルターバッジ */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center">
              <span className="text-neutral-500 mr-2">フィルター:</span>
              {renderFilterBadges()}
              <button
                onClick={clearAllFilters}
                className="text-primary underline text-sm"
              >
                すべてクリア
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row">
          {/* モバイルフィルタートグル */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full bg-white p-4 rounded-lg shadow-md"
            >
              <span className="font-medium flex items-center">
                <Funnel size={20} className="mr-2" />
                フィルター {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </span>
              <span>{showFilters ? '閉じる' : '開く'}</span>
            </button>
          </div>
          
          {/* サイドバーフィルター */}
          <div className={`md:w-1/4 lg:w-1/5 md:pr-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="font-bold text-lg mb-4 border-b pb-2">カテゴリー</h2>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category.slug}`}
                      name="category"
                      className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      checked={searchParams.category === category.slug}
                      onChange={() => handleFilterChange('category', category.slug)}
                    />
                    <label
                      htmlFor={`category-${category.slug}`}
                      className="ml-2 text-neutral-700 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
                
                {searchParams.category && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="text-primary text-sm hover:underline"
                    >
                      カテゴリー指定を解除
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="font-bold text-lg mb-4 border-b pb-2">料金帯</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="price-free"
                    name="price_range"
                    className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={searchParams.price_range === 'free'}
                    onChange={() => handleFilterChange('price_range', 'free')}
                  />
                  <label
                    htmlFor="price-free"
                    className="ml-2 text-neutral-700 cursor-pointer"
                  >
                    無料
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="price-low"
                    name="price_range"
                    className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={searchParams.price_range === 'low'}
                    onChange={() => handleFilterChange('price_range', 'low')}
                  />
                  <label
                    htmlFor="price-low"
                    className="ml-2 text-neutral-700 cursor-pointer"
                  >
                    1万円未満
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="price-medium"
                    name="price_range"
                    className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={searchParams.price_range === 'medium'}
                    onChange={() => handleFilterChange('price_range', 'medium')}
                  />
                  <label
                    htmlFor="price-medium"
                    className="ml-2 text-neutral-700 cursor-pointer"
                  >
                    1万円～5万円
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="price-high"
                    name="price_range"
                    className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={searchParams.price_range === 'high'}
                    onChange={() => handleFilterChange('price_range', 'high')}
                  />
                  <label
                    htmlFor="price-high"
                    className="ml-2 text-neutral-700 cursor-pointer"
                  >
                    5万円以上
                  </label>
                </div>
                
                {searchParams.price_range && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleFilterChange('price_range', '')}
                      className="text-primary text-sm hover:underline"
                    >
                      料金帯指定を解除
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-bold text-lg mb-4 border-b pb-2">平均評価</h2>
              <div className="space-y-2">
                {[4, 3, 2, 0].map(rating => (
                  <div key={rating} className="flex items-center">
                    <input
                      type="radio"
                      id={`rating-${rating}`}
                      name="min_rating"
                      className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      checked={searchParams.min_rating === String(rating)}
                      onChange={() => handleFilterChange('min_rating', String(rating))}
                    />
                    <label
                      htmlFor={`rating-${rating}`}
                      className="ml-2 text-neutral-700 cursor-pointer flex items-center"
                    >
                      {rating > 0 ? (
                        <>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < rating ? 'text-yellow-400' : 'text-neutral-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="ml-1">以上</span>
                        </>
                      ) : (
                        'すべて表示'
                      )}
                    </label>
                  </div>
                ))}
                
                {searchParams.min_rating && (
                  <div className="mt-2">
                    <button
                      onClick={() => handleFilterChange('min_rating', '')}
                      className="text-primary text-sm hover:underline"
                    >
                      評価指定を解除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* メインコンテンツエリア */}
          <div className="md:w-3/4 lg:w-4/5">
            {/* 検索結果ヘッダー */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-bold text-lg mb-2 sm:mb-0">
                  {searchParams.q ? (
                    <>「{searchParams.q}」の検索結果</>
                  ) : (
                    <>すべてのサービス</>
                  )}
                </h2>
                
                <div className="text-neutral-600">
                  {loading ? (
                    <span className="flex items-center">
                      <CircleNotch size={18} className="animate-spin mr-2" />
                      検索中...
                    </span>
                  ) : (
                    <>{totalResults}件のサービスが見つかりました</>
                  )}
                </div>
              </div>
            </div>
            
            {/* ローディング表示 */}
            {loading ? (
              <div className="text-center py-16">
                <CircleNotch size={48} className="animate-spin mx-auto text-primary" />
                <p className="mt-4 text-lg text-neutral-600">サービス情報を読み込み中...</p>
              </div>
            ) : (
              // 検索結果表示
              <>
                {error ? (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <h3 className="text-red-800 font-medium">エラーが発生しました</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      再読み込み
                    </button>
                  </div>
                ) : (
                  <>
                    {services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map(service => (
                          <ServiceCard key={service.id} service={service} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">検索結果が見つかりませんでした</h3>
                        <p className="text-neutral-600 mb-6">
                          検索条件を変更するか、別のキーワードで検索してみてください。
                        </p>
                        <button
                          onClick={clearAllFilters}
                          className="btn btn-primary"
                        >
                          すべてのフィルターをクリア
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
