import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, CircleNotch } from '@phosphor-icons/react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 記事情報の取得
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${slug}`);
        if (!response.ok) {
          throw new Error('記事の取得に失敗しました');
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        console.error('記事取得エラー:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
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
      setArticle(null);
    };
  }, []);

  // ローディング表示
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <CircleNotch size={48} className="animate-spin mx-auto text-primary" />
        <p className="mt-4 text-lg font-medium text-neutral-700">記事を読み込み中...</p>
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

  // 記事が見つからない場合
  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-neutral-100 p-8 rounded-xl max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">記事が見つかりません</h2>
          <p className="text-neutral-600 mb-6">
            指定された記事が存在しないか、削除された可能性があります。
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
    <div className="bg-white">
      {/* ヒーローセクション */}
      <div className="bg-neutral-800 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-neutral-300 hover:text-white mb-6">
            <ArrowLeft size={20} className="mr-1" />
            トップページに戻る
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex flex-wrap items-center text-neutral-300 text-sm">
            <div className="flex items-center mr-6 mb-2">
              <Calendar size={18} className="mr-1" />
              <time dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center">
                <Tag size={18} className="mr-1" />
                {article.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="mr-2 mb-2 hover:text-primary"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 記事カバー画像 */}
      {article.cover_image && (
        <div className="w-full max-h-96 overflow-hidden">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full object-cover"
          />
        </div>
      )}
      
      {/* 記事本文 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <article className="prose prose-lg prose-neutral max-w-none">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }} />
          </article>
          
          {/* タグ */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <h3 className="text-lg font-medium mb-3">関連タグ</h3>
              <div className="flex flex-wrap">
                {article.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="bg-neutral-100 hover:bg-primary hover:text-white px-3 py-1 rounded-full text-sm mr-2 mb-2 transition-colors duration-300"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* 関連記事（将来的に実装） */}
          <div className="mt-12 pt-6 border-t border-neutral-200">
            <h3 className="text-xl font-bold mb-6">関連記事</h3>
            
            <div className="text-center py-8 text-neutral-500">
              関連記事は現在利用できません。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
