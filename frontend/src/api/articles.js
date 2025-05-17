// 記事関連APIの一元化
import apiClient from './client';

// 記事一覧の取得
export const getArticles = async () => {
  try {
    const response = await apiClient.get('/articles');
    return response.data;
  } catch (error) {
    console.error('記事一覧の取得に失敗しました:', error);
    throw error;
  }
};

// 特定の記事の取得
export const getArticleBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/articles/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`記事「${slug}」の取得に失敗しました:`, error);
    throw error;
  }
};

// 記事の作成（編集者または管理者のみ）
export const createArticle = async (articleData) => {
  try {
    const response = await apiClient.post('/articles', articleData);
    return response.data;
  } catch (error) {
    console.error('記事の作成に失敗しました:', error);
    throw error;
  }
};

// 記事の更新（編集者または管理者のみ）
export const updateArticle = async (articleId, articleData) => {
  try {
    const response = await apiClient.put(`/articles/${articleId}`, articleData);
    return response.data;
  } catch (error) {
    console.error(`記事「${articleId}」の更新に失敗しました:`, error);
    throw error;
  }
};

// 記事の削除（編集者または管理者のみ）
export const deleteArticle = async (articleId) => {
  try {
    await apiClient.delete(`/articles/${articleId}`);
    return true;
  } catch (error) {
    console.error(`記事「${articleId}」の削除に失敗しました:`, error);
    throw error;
  }
};
