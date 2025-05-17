// サービス関連APIの一元化
import apiClient from './client';

// サービス一覧の取得
export const getServices = async () => {
  try {
    const response = await apiClient.get('/services');
    return response.data;
  } catch (error) {
    console.error('サービス一覧の取得に失敗しました:', error);
    throw error;
  }
};

// 特定のサービスの取得
export const getServiceBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/services/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`サービス「${slug}」の取得に失敗しました:`, error);
    throw error;
  }
};

// サービスの作成（管理者のみ）
export const createService = async (serviceData) => {
  try {
    const response = await apiClient.post('/services', serviceData);
    return response.data;
  } catch (error) {
    console.error('サービスの作成に失敗しました:', error);
    throw error;
  }
};

// サービスの更新（管理者のみ）
export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await apiClient.put(`/services/${serviceId}`, serviceData);
    return response.data;
  } catch (error) {
    console.error(`サービス「${serviceId}」の更新に失敗しました:`, error);
    throw error;
  }
};

// サービスの削除（管理者のみ）
export const deleteService = async (serviceId) => {
  try {
    await apiClient.delete(`/services/${serviceId}`);
    return true;
  } catch (error) {
    console.error(`サービス「${serviceId}」の削除に失敗しました:`, error);
    throw error;
  }
};
