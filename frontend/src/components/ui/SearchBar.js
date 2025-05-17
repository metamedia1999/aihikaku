import React from 'react';

/**
 * 共通検索バーコンポーネント
 * 検索機能を持つ画面で再利用可能
 */
const SearchBar = ({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "検索キーワードを入力...",
  buttonText = "検索"
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="検索キーワード"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {buttonText}
      </button>
    </form>
  );
};

export default SearchBar;
