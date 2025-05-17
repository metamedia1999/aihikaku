import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold text-neutral-800 mb-6">ページが見つかりません</h2>
      <p className="text-lg text-neutral-600 mb-8 text-center max-w-md">
        お探しのページが存在しないか、移動した可能性があります。
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="btn btn-primary flex items-center justify-center"
        >
          <ArrowLeft size={20} className="mr-2" />
          トップページに戻る
        </Link>
        
        <Link
          to="/search"
          className="btn btn-outline"
        >
          サービスを探す
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
