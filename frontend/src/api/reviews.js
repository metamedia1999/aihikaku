// レビュー関連APIの一元化
import apiClient from './client';

// レビュー一覧の取得
export const getReviews = async (serviceId = null) => {
  try {
    const params = serviceId ? { service_id: serviceId } : {};
    const response = await apiClient.get('/reviews', { params });
    return response.data;
  } catch (error) {
    console.error('レビュー一覧の取得に失敗しました:', error);
    throw error;
  }
};

// 特定のレビューの取得
export const getReviewById = async (reviewId) => {
  try {
    const response = await apiClient.get(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`レビュー「${reviewId}」の取得に失敗しました:`, error);
    throw error;
  }
};

// レビューの作成（ログインユーザーのみ）
export const createReview = async (reviewData) => {
  try {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('レビューの作成に失敗しました:', error);
    throw error;
  }
};

// レビューの更新（投稿者または管理者のみ）
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`レビュー「${reviewId}」の更新に失敗しました:`, error);
    throw error;
  }
};

// レビューの削除（投稿者または管理者のみ）
export const deleteReview = async (reviewId) => {
  try {
    await apiClient.delete(`/reviews/${reviewId}`);
    return true;
  } catch (error) {
    console.error(`レビュー「${reviewId}」の削除に失敗しました:`, error);
    throw error;
  }
};
