import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
const API_URL = "http://localhost:8080/api/categories";

// Tạo instance axios với base URL
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm để lấy Bearer Token từ localStorage (hoặc nguồn khác)
const getToken = () => {
  return Cookies.get('authToken'); // Giả sử token được lưu trong localStorage với key 'authToken'
};

// Interceptor để thêm token vào header cho các yêu cầu cần xác thực
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && (config.method === 'post' || config.method === 'put' || config.method === 'delete')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm lấy danh sách danh mục (không cần token vì GET đã permitAll)
export const fetchCategories = async () => {
  try {
    const response = await apiClient.get();
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi tải danh sách loại sản phẩm!');
  }
};

// Hàm thêm mới danh mục (cần token)
export const addCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('', categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi thêm loại sản phẩm!');
  }
};

// Hàm cập nhật danh mục (cần token)
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await apiClient.put(`/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật loại sản phẩm!');
  }
};

// Hàm xóa danh mục (cần token)
export const deleteCategory = async (id) => {
  try {
    await apiClient.delete(`/${id}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi xóa loại sản phẩm!');
  }
};