import axios from 'axios';
import Cookies from 'js-cookie';

// Tạo instance axios với base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm đăng ký
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Đăng ký thất bại!');
  }
};

// Hàm đăng nhập
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/login', credentials);
    const token = response.data.token; // Giả định BE trả về token trong response
    const role = response.data.role; // Giả định BE trả về role trong response (nếu có)

    if (token) {
      // Lưu token vào cookie với thời hạn 7 ngày
      Cookies.set('authToken', token, { expires: 7 });
    }
    return { token, role }; // Trả về cả token và role (nếu có)
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Đăng nhập thất bại!');
  }
};

// Hàm lấy token từ cookie
export const getToken = () => {
  return Cookies.get('authToken');
};

// Hàm đăng xuất (xóa token)
export const logout = () => {
  Cookies.remove('authToken');
};