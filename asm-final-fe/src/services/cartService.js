import axios from 'axios';
import Cookies from 'js-cookie';

// Tạo instance axios với base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Đảm bảo gửi cookie
});

// Lấy token từ cookie
export const getToken = () => {
  return Cookies.get('authToken');
};

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log('Token from cookie in interceptor:', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No token found in cookie, request may fail authentication');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Lấy danh sách sản phẩm trong giỏ hàng
export const getCartItems = async () => {
  try {
    const response = await apiClient.get('/cart');
    return response.data; // Trả về danh sách Cart từ backend
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi lấy giỏ hàng');
  }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (cartItem) => {
  try {
    const response = await apiClient.post('/addCart', cartItem);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi thêm vào giỏ hàng');
  }
};

// Cập nhật số lượng
export const updateCartQuantity = async (cartId, quantity) => {
  try {
    const response = await apiClient.put(`/cart/${cartId}`, { quantity });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi cập nhật số lượng');
  }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (cartId) => {
  try {
    await apiClient.delete(`/cart/${cartId}`);
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng');
  }
};