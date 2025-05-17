// 安全なマークダウンレンダリングコンポーネント
import React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// マークダウンオプションの設定
marked.setOptions({
  gfm: true,          // GitHub Flavored Markdown を有効化
  breaks: true,       // 改行を <br> に変換
  headerIds: true,    // ヘッダーにIDを付与
  mangle: false,      // リンクのマングリングを無効化
  sanitize: false,    // DOMPurifyを使用するため、markedの内部サニタイズは無効化
});

/**
 * 安全なマークダウンレンダリングコンポーネント
 * XSS攻撃を防止するためにDOMPurifyでサニタイズを行う
 */
const SafeMarkdown = ({ markdown, className = '' }) => {
  // マークダウンが存在しない場合は空のdivを返す
  if (!markdown) {
    return <div className={className}></div>;
  }

  // マークダウンをHTMLに変換
  const rawHtml = marked(markdown);
  
  // DOMPurifyでHTMLをサニタイズ
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'name', 'target', 'src', 'alt', 'class', 'id', 'style'
    ],
    // 外部リンクには rel="noopener noreferrer" を追加
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed'],
    ADD_ATTR: ['target', 'rel'],
    ADD_URI_SAFE_ATTR: ['src', 'href'],
  });

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeMarkdown;
