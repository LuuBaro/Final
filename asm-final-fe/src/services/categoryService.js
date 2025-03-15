import axios from 'axios';

const API_URL = "http://localhost:8080/api/categories";

// Tạo instance axios với base URL
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm lấy danh sách danh mục
export const fetchCategories = async () => {
  try {
    const response = await apiClient.get();
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách loại sản phẩm!');
  }
};

// Hàm thêm mới danh mục
export const addCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('', categoryData); // '' vì baseURL đã định nghĩa
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi thêm loại sản phẩm!');
  }
};

// Hàm cập nhật danh mục
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật loại sản phẩm!');
  }
};

// Hàm xóa danh mục
export const deleteCategory = async (id) => {
  try {
    await apiClient.delete(`/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa loại sản phẩm!');
  }
};