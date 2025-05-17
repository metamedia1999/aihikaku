import React from 'react';
import { Star } from '@phosphor-icons/react';

const Rating = ({ value, max = 5, showValue = true, size = 'md' }) => {
  // 値のバリデーション
  const validValue = Math.min(Math.max(0, value), max);
  const roundedValue = Math.round(validValue * 2) / 2; // 0.5単位に丸める
  
  // サイズに応じたスタイル
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  // 星のサイズ
  const starSize = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  // 星を生成する関数
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= max; i++) {
      if (i <= roundedValue) {
        // 満星
        stars.push(
          <Star 
            key={i} 
            weight="fill" 
            className="text-yellow-400" 
            size={starSize[size]} 
          />
        );
      } else if (i - 0.5 === roundedValue) {
        // 半星（実際には表現が難しいのでここでは満星と同じ扱い）
        stars.push(
          <Star 
            key={i} 
            weight="fill" 
            className="text-yellow-400" 
            size={starSize[size]} 
          />
        );
      } else {
        // 空星
        stars.push(
          <Star 
            key={i} 
            weight="regular" 
            className="text-neutral-300" 
            size={starSize[size]} 
          />
        );
      }
    }
    
    return stars;
  };
  
  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <div className="flex">
        {renderStars()}
      </div>
      {showValue && (
        <span className="ml-2 font-medium text-neutral-700">
          {roundedValue.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
