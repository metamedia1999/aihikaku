import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from '@phosphor-icons/react';

const ServiceCard = ({ service }) => {
  // サービスが存在しない場合の処理
  if (!service) return null;
  
  // レーティングスターの生成
  const renderRatingStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2; // 0.5単位に丸める
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        // 満星
        stars.push(<Star key={i} weight="fill" className="text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        // 半星（実際には表現が難しいのでここでは満星と同じ扱い）
        stars.push(<Star key={i} weight="fill" className="text-yellow-400" />);
      } else {
        // 空星
        stars.push(<Star key={i} weight="regular" className="text-neutral-300" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="service-card bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* サービス画像 */}
      <div className="relative h-48 bg-neutral-200 overflow-hidden">
        {service.hero_image ? (
          <img 
            src={service.hero_image} 
            alt={service.name} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
            <span className="text-neutral-400">画像なし</span>
          </div>
        )}
        
        {/* カテゴリーバッジ */}
        {service.category_name && (
          <div className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded-full">
            {service.category_name}
          </div>
        )}
      </div>
      
      {/* カードコンテンツ */}
      <div className="p-5">
        {/* 会社名 */}
        {service.vendor_name && (
          <div className="text-sm text-neutral-600 mb-1">{service.vendor_name}</div>
        )}
        
        {/* サービス名 */}
        <h3 className="service-card-title text-xl font-bold mb-2 transition-colors duration-300">
          <Link to={`/service/${service.slug}`} className="hover:text-primary">
            {service.name}
          </Link>
        </h3>
        
        {/* 簡易説明 */}
        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
          {service.short_description}
        </p>
        
        {/* レーティングと料金 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <div className="flex">
              {renderRatingStars(service.rating_overall)}
            </div>
            <span className="ml-2 text-sm font-medium text-neutral-700">
              {service.rating_overall.toFixed(1)}
            </span>
          </div>
          
          {service.pricing_plan && service.pricing_plan.length > 0 && (
            <div className="text-sm">
              <span className="font-bold text-neutral-800">
                {service.pricing_plan[0].price_jpy === 0 
                  ? '無料' 
                  : `${service.pricing_plan[0].price_jpy.toLocaleString()}円〜`}
              </span>
              <span className="text-neutral-500 text-xs ml-1">
                /{service.pricing_plan[0].billing_cycle.includes('月') ? '月' : '年'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
