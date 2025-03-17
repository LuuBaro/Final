import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const getToken = () => {
  return Cookies.get('authToken');
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && (config.method === 'get' || config.method === 'post' || config.method === 'put' || config.method === 'delete')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lấy tất cả người dùng
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi lấy danh sách người dùng');
  }
};

// Lấy thông tin người dùng theo ID
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi lấy thông tin người dùng');
  }
};

// Đăng ký người dùng mới
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi đăng ký người dùng');
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi cập nhật người dùng');
  }
};

// Xóa người dùng
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi xóa người dùng');
  }
};