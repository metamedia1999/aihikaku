import React from 'react';

/**
 * 共通データテーブルコンポーネント
 * 管理画面などでデータ一覧表示に再利用可能
 */
const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  emptyMessage = "データがありません",
  isLoading = false
}) => {
  if (isLoading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-4">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column, index) => (
              <th 
                key={index}
                className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b"
              >
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex}
                  className="px-4 py-2 text-sm text-gray-700 border-b"
                >
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-2 text-sm border-b">
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        編集
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="text-red-600 hover:text-red-800"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
