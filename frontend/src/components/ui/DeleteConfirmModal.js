import React, { useState } from 'react';

/**
 * 削除確認モーダルコンポーネント
 * 削除操作前の確認に再利用可能
 */
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "削除の確認", 
  message = "本当にこのアイテムを削除しますか？この操作は元に戻せません。",
  confirmButtonText = "削除する",
  cancelButtonText = "キャンセル"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
