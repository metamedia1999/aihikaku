import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Rating from '../components/ui/Rating';
import { Tab } from '@headlessui/react';
import { ArrowRight, Check, X, Star, ThumbsUp, ThumbsDown, CircleNotch } from '@phosphor-icons/react';

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [category, setCategory] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // サービス詳細の取得
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        // サービス情報の取得
        const serviceResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/services/${slug}`);
        if (!serviceResponse.ok) {
          throw new Error('サービス情報の取得に失敗しました');
        }
        const serviceData = await serviceResponse.json();
        setService(serviceData);

        // カテゴリー情報の取得
        if (serviceData.category_id) {
          try {
            const categoryResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
            if (categoryResponse.ok) {
              const categoriesData = await categoryResponse.json();
              const matchingCategory = categoriesData.find(cat => cat.id === serviceData.category_id);
              if (matchingCategory) {
                setCategory(matchingCategory);
              }
            }
          } catch (err) {
            console.error('カテゴリー情報取得エラー:', err);
          }
        }

        // ベンダー情報の取得
        if (serviceData.vendor_id) {
          try {
            const vendorResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/companies/${serviceData.vendor_id}`);
            if (vendorResponse.ok) {
              const vendorData = await vendorResponse.json();
              setVendor(vendorData);
            }
          } catch (err) {
            console.error('ベンダー情報取得エラー:', err);
          }
        }

        // レビュー情報の取得
        try {
          const reviewsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reviews?service_id=${serviceData.id}`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData);
          }
        } catch (err) {
          console.error('レビュー情報取得エラー:', err);
        }
      } catch (err) {
        console.error('サービス詳細取得エラー:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [slug]);

  // マークダウンをHTMLに変換する関数
  const renderMarkdown = (markdown) => {
    if (!markdown) return '';
    
    // 簡易的なマークダウンパース（本番環境では marked.js などのライブラリを使用すべき）
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold my-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n- (.*)/g, '<li class="ml-6 list-disc my-1">$1</li>')
      .replace(/\n/g, '<br>');
    
    return html;
  };

  // メモリリークを防ぐためのクリーンアップ
  useEffect(() => {
    return () => {
      setService(null);
      setCategory(null);
      setVendor(null);
      setReviews([]);
    };
  }, []);

  // ローディング表示
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <CircleNotch size={48} className="animate-spin mx-auto text-primary" />
        <p className="mt-4 text-lg font-medium text-neutral-700">サービス情報を読み込み中...</p>
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
          <Link
            to="/"
            className="mt-3 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  // サービスが見つからない場合
  if (!service) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-neutral-100 p-8 rounded-xl max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">サービスが見つかりません</h2>
          <p className="text-neutral-600 mb-6">
            指定されたサービスが存在しないか、削除された可能性があります。
          </p>
          <Link
            to="/"
            className="btn btn-primary"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="bg-neutral-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            {/* 左側: サービス情報 */}
            <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
              <div className="flex items-center mb-4">
                {vendor && vendor.logo && (
                  <img
                    src={vendor.logo}
                    alt={vendor.name}
                    className="w-12 h-12 object-contain bg-white rounded-lg p-1 mr-3"
                  />
                )}
                {category && (
                  <span className="px-3 py-1 bg-primary rounded-full text-sm font-medium">
                    {category.name}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{service.name}</h1>
              
              <p className="text-neutral-300 text-lg mb-6">
                {service.short_description}
              </p>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center">
                  <Rating value={service.rating_overall} />
                </div>
                
                <div className="text-sm">
                  <span className="text-neutral-400">レビュー: </span>
                  <span className="font-medium">{reviews.length}件</span>
                </div>
                
                {service.pricing_plan && service.pricing_plan.length > 0 && (
                  <div className="text-sm">
                    <span className="text-neutral-400">料金: </span>
                    <span className="font-medium">
                      {service.pricing_plan[0].price_jpy === 0 
                        ? '無料' 
                        : `${service.pricing_plan[0].price_jpy.toLocaleString()}円〜`}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                <a
                  href={service.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  公式サイトへ <ArrowRight size={18} className="ml-1 inline" />
                </a>
                
                <button className="btn btn-outline">
                  資料ダウンロード
                </button>
              </div>
            </div>
            
            {/* 右側: ヒーロー画像 */}
            <div className="md:w-1/3">
              <div className="rounded-xl overflow-hidden shadow-lg">
                {service.hero_image ? (
                  <img
                    src={service.hero_image}
                    alt={service.name}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-neutral-700 flex items-center justify-center">
                    <span className="text-neutral-400">画像なし</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* タブコンテンツ */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-neutral-100 p-1 mb-8">
              <Tab
                className={({ selected }) =>
                  `w-full py-3 text-sm font-medium rounded-lg transition-all
                  ${selected 
                    ? 'bg-white text-primary shadow'
                    : 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                  }`
                }
              >
                概要
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full py-3 text-sm font-medium rounded-lg transition-all
                  ${selected 
                    ? 'bg-white text-primary shadow'
                    : 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                  }`
                }
              >
                機能
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full py-3 text-sm font-medium rounded-lg transition-all
                  ${selected 
                    ? 'bg-white text-primary shadow'
                    : 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                  }`
                }
              >
                料金
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full py-3 text-sm font-medium rounded-lg transition-all
                  ${selected 
                    ? 'bg-white text-primary shadow'
                    : 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                  }`
                }
              >
                レビュー
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full py-3 text-sm font-medium rounded-lg transition-all
                  ${selected 
                    ? 'bg-white text-primary shadow'
                    : 'text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                  }`
                }
              >
                会社情報
              </Tab>
            </Tab.List>
            
            <Tab.Panels>
              {/* 概要タブ */}
              <Tab.Panel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">サービス概要</h2>
                    <p className="text-neutral-700 mb-6">{service.short_description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-neutral-50 p-4 rounded-lg">
                        <div className="text-sm text-neutral-500 mb-1">総合評価</div>
                        <div className="flex items-center">
                          <Rating value={service.rating_overall} size="lg" />
                        </div>
                      </div>
                      <div className="bg-neutral-50 p-4 rounded-lg">
                        <div className="text-sm text-neutral-500 mb-1">UI/UX</div>
                        <div className="flex items-center">
                          <Rating value={service.rating_uiux} size="lg" />
                        </div>
                      </div>
                      <div className="bg-neutral-50 p-4 rounded-lg">
                        <div className="text-sm text-neutral-500 mb-1">コストパフォーマンス</div>
                        <div className="flex items-center">
                          <Rating value={service.rating_cost} size="lg" />
                        </div>
                      </div>
                    </div>
                    
                    {/* ギャラリー画像 */}
                    {service.gallery_images && service.gallery_images.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4">ギャラリー</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {service.gallery_images.map((image, index) => (
                            <div key={index} className="rounded-lg overflow-hidden shadow-md">
                              <img
                                src={image}
                                alt={`${service.name} screenshot ${index + 1}`}
                                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {/* 長所・短所 */}
                    <div className="bg-neutral p-6 rounded-xl mb-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <ThumbsUp size={20} className="text-success mr-2" weight="fill" />
                        メリット
                      </h3>
                      <ul className="space-y-2">
                        {service.pros && service.pros.map((pro, index) => (
                          <li key={index} className="flex items-start">
                            <Check size={18} className="text-success mt-1 mr-2 flex-shrink-0" weight="bold" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-neutral p-6 rounded-xl">
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <ThumbsDown size={20} className="text-danger mr-2" weight="fill" />
                        デメリット
                      </h3>
                      <ul className="space-y-2">
                        {service.cons && service.cons.map((con, index) => (
                          <li key={index} className="flex items-start">
                            <X size={18} className="text-danger mt-1 mr-2 flex-shrink-0" weight="bold" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              
              {/* 機能タブ */}
              <Tab.Panel>
                <div className="markdown prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(service.long_description) }} />
                </div>
              </Tab.Panel>
              
              {/* 料金タブ */}
              <Tab.Panel>
                <h2 className="text-2xl font-bold mb-6">料金プラン</h2>
                
                {service.pricing_plan && service.pricing_plan.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-neutral-100">
                          <th className="px-6 py-3 text-left font-bold">プラン</th>
                          <th className="px-6 py-3 text-left font-bold">料金</th>
                          <th className="px-6 py-3 text-left font-bold">課金サイクル</th>
                          <th className="px-6 py-3 text-left font-bold"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.pricing_plan.map((plan, index) => (
                          <tr key={index} className="border-b border-neutral-200 hover:bg-neutral-50">
                            <td className="px-6 py-4 font-medium">{plan.plan}</td>
                            <td className="px-6 py-4">
                              {plan.price_jpy === 0 
                                ? '無料' 
                                : `${plan.price_jpy.toLocaleString()}円`}
                            </td>
                            <td className="px-6 py-4">{plan.billing_cycle}</td>
                            <td className="px-6 py-4">
                              <a
                                href={service.official_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                              >
                                詳細を見る
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-neutral-500">料金情報が登録されていません。</p>
                )}
                
                <div className="mt-8 bg-neutral p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">料金に関する注意事項</h3>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-700">
                    <li>表示価格はすべて税抜きです。</li>
                    <li>事業規模や利用ユーザー数によって、カスタム料金プランが提供される場合があります。</li>
                    <li>料金プランは予告なく変更される場合があります。最新情報は公式サイトでご確認ください。</li>
                  </ul>
                </div>
              </Tab.Panel>
              
              {/* レビュータブ */}
              <Tab.Panel>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-6">ユーザーレビュー</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="bg-neutral p-6 rounded-xl text-center">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {service.rating_overall.toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-2">
                        <Rating value={service.rating_overall} showValue={false} size="lg" />
                      </div>
                      <div className="text-neutral-500 text-sm">
                        {reviews.length}件のレビュー
                      </div>
                    </div>
                    
                    <div className="md:col-span-3">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-24 text-sm">UI/UX</div>
                          <div className="flex-grow h-2 bg-neutral-200 rounded-full">
                            <div
                              className="h-2 bg-primary rounded-full"
                              style={{ width: `${(service.rating_uiux / 5) * 100}%` }}
                            ></div>
                          </div>
                          <div className="w-10 text-right font-medium ml-2">
                            {service.rating_uiux.toFixed(1)}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-24 text-sm">コスト</div>
                          <div className="flex-grow h-2 bg-neutral-200 rounded-full">
                            <div
                              className="h-2 bg-primary rounded-full"
                              style={{ width: `${(service.rating_cost / 5) * 100}%` }}
                            ></div>
                          </div>
                          <div className="w-10 text-right font-medium ml-2">
                            {service.rating_cost.toFixed(1)}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-24 text-sm">サポート</div>
                          <div className="flex-grow h-2 bg-neutral-200 rounded-full">
                            <div
                              className="h-2 bg-primary rounded-full"
                              style={{ width: `${(service.rating_support / 5) * 100}%` }}
                            ></div>
                          </div>
                          <div className="w-10 text-right font-medium ml-2">
                            {service.rating_support.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* レビューリスト */}
                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.map(review => (
                        <div key={review.id} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{review.title}</h3>
                              <div className="flex items-center mt-1">
                                <Rating value={review.rating} size="sm" />
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{review.author_name}</div>
                              <div className="text-neutral-500 text-sm">{review.author_role}</div>
                            </div>
                          </div>
                          
                          <p className="text-neutral-700">{review.body}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-neutral-500 text-center py-8">
                        まだレビューがありません。
                      </div>
                    )}
                  </div>
                </div>
              </Tab.Panel>
              
              {/* 会社情報タブ */}
              <Tab.Panel>
                {vendor ? (
                  <div>
                    <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
                      <div className="mb-4 md:mb-0 md:mr-6">
                        {vendor.logo ? (
                          <img
                            src={vendor.logo}
                            alt={vendor.name}
                            className="w-32 h-32 object-contain bg-white rounded-lg p-3 border border-neutral-200"
                          />
                        ) : (
                          <div className="w-32 h-32 bg-neutral-100 rounded-lg flex items-center justify-center">
                            <span className="text-neutral-400">ロゴなし</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{vendor.name}</h2>
                        {vendor.tagline && <p className="text-neutral-700 mb-4">{vendor.tagline}</p>}
                        
                        {vendor.url && (
                          <a
                            href={vendor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            公式サイトを訪問 <ArrowRight size={16} className="ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-neutral p-6 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">会社概要</h3>
                        
                        <table className="w-full">
                          <tbody>
                            {vendor.founding_year && (
                              <tr className="border-b border-neutral-200">
                                <td className="py-3 font-medium">設立年</td>
                                <td className="py-3">{vendor.founding_year}年</td>
                              </tr>
                            )}
                            
                            {vendor.hq_location && (
                              <tr className="border-b border-neutral-200">
                                <td className="py-3 font-medium">本社所在地</td>
                                <td className="py-3">{vendor.hq_location}</td>
                              </tr>
                            )}
                            
                            {vendor.employee_count && (
                              <tr className="border-b border-neutral-200">
                                <td className="py-3 font-medium">従業員数</td>
                                <td className="py-3">約{vendor.employee_count.toLocaleString()}名</td>
                              </tr>
                            )}
                            
                            {vendor.url && (
                              <tr>
                                <td className="py-3 font-medium">Webサイト</td>
                                <td className="py-3">
                                  <a
                                    href={vendor.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {vendor.url.replace(/^https?:\/\//, '')}
                                  </a>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="bg-neutral p-6 rounded-lg">
                        <h3 className="font-bold text-lg mb-4">提供サービス</h3>
                        
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 mr-3 flex-shrink-0">
                            {service.hero_image ? (
                              <img
                                src={service.hero_image}
                                alt={service.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-neutral-200 rounded-lg"></div>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <div className="flex mt-1">
                              <Rating value={service.rating_overall} size="sm" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <Link
                            to={`/search?vendor=${vendor.id}`}
                            className="text-primary hover:underline flex items-center"
                          >
                            すべてのサービスを見る <ArrowRight size={16} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-neutral-500 text-center py-8">
                    会社情報が登録されていません。
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </section>
      
      {/* CTA セクション */}
      <section className="bg-primary py-12 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {service.name}をお探しですか？
          </h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            公式サイトで詳細情報を確認し、あなたのビジネスに最適なプランを見つけましょう。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <a
              href={service.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-white text-primary hover:bg-neutral-100"
            >
              公式サイトへ <ArrowRight size={18} className="ml-1 inline" />
            </a>
            <button className="btn bg-primary-dark text-white border border-white hover:bg-primary-light">
              資料をダウンロード
            </button>
          </div>
        </div>
      </section>
      
      {/* 関連サービスセクション */}
      <section className="section bg-neutral">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">関連サービス</h2>
          
          {/* ここに関連サービスのリストを表示する予定 */}
          <div className="text-center py-8 text-neutral-500">
            関連サービスのデータがまだ利用できません。
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
