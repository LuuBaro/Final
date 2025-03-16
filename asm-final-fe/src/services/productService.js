// src/services/productService.js
import axios from 'axios';

// Tạo instance axios với base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000, // Thời gian chờ tối đa (10 giây)
  headers: {
    'Content-Type': 'application/json',
    // Thêm header Authorization nếu cần (ví dụ: token)
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
});

// Hàm lấy danh sách sản phẩm
export const getProducts = async () => {
  try {
    const response = await apiClient.get('/products');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể lấy danh sách sản phẩm!');
  }
};

// Hàm lấy danh sách danh mục
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể lấy danh sách danh mục!');
  }
};

// Hàm thêm sản phẩm mới
export const addProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể thêm sản phẩm!');
  }
};

// Hàm cập nhật sản phẩm
export const updateProduct = async (id, productData) => {
  try {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể cập nhật sản phẩm!');
  }
};

// Hàm xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    await apiClient.delete(`/products/${id}`);
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể xóa sản phẩm!');
  }
};

// Hàm import sản phẩm từ JSON
export const importProductsFromJson = async (products) => {
  try {
    const response = await apiClient.post('/products/import/json', products);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể import sản phẩm!');
  }
};