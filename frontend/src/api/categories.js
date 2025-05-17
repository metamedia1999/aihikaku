// カテゴリ関連APIの一元化
import apiClient from './client';

// カテゴリ一覧の取得
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('カテゴリ一覧の取得に失敗しました:', error);
    throw error;
  }
};

// 特定のカテゴリの取得
export const getCategoryBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/categories/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`カテゴリ「${slug}」の取得に失敗しました:`, error);
    throw error;
  }
};

// カテゴリの作成（管理者のみ）
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('カテゴリの作成に失敗しました:', error);
    throw error;
  }
};

// カテゴリの更新（管理者のみ）
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await apiClient.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`カテゴリ「${categoryId}」の更新に失敗しました:`, error);
    throw error;
  }
};

// カテゴリの削除（管理者のみ）
export const deleteCategory = async (categoryId) => {
  try {
    await apiClient.delete(`/categories/${categoryId}`);
    return true;
  } catch (error) {
    console.error(`カテゴリ「${categoryId}」の削除に失敗しました:`, error);
    throw error;
  }
};
