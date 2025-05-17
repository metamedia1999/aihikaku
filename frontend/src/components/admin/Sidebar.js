import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  House, 
  Package, 
  Buildings, 
  ListBullets, 
  Article, 
  SignOut 
} from '@phosphor-icons/react';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  // メニュー項目
  const menuItems = [
    { path: '/admin', name: 'ダッシュボード', icon: <House size={20} /> },
    { path: '/admin/services', name: 'サービス管理', icon: <Package size={20} /> },
    { path: '/admin/companies', name: '企業管理', icon: <Buildings size={20} /> },
    { path: '/admin/categories', name: 'カテゴリー管理', icon: <ListBullets size={20} /> },
    { path: '/admin/articles', name: '記事管理', icon: <Article size={20} /> },
  ];

  // 現在のパスがメニュー項目と一致するかチェック
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="bg-neutral-800 text-white h-screen w-64 flex-shrink-0 overflow-y-auto">
      <div className="p-5">
        <div className="mb-8">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-white">
              AI代行<span className="text-primary">.com</span>
            </span>
          </Link>
          <div className="text-neutral-400 text-sm mt-1">管理パネル</div>
        </div>
        
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto pt-8 border-t border-neutral-700 mt-8">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-neutral-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
          >
            <SignOut size={20} className="mr-3" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
