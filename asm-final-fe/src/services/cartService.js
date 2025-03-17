import axios from 'axios';
import Cookies from 'js-cookie';

// Tạo instance axios với base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Đảm bảo gửi cookie nếu backend yêu cầu
});

// Lấy token từ cookie
export const getToken = () => {
  return Cookies.get('authToken'); // Token được lưu trong cookie với key 'authToken'
};

// Interceptor để thêm token vào header cho tất cả các yêu cầu
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && (config.method === 'get' || config.method === 'post' || config.method === 'put' || config.method === 'delete')) {
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

// Interceptor để xử lý lỗi 401 (token hết hạn hoặc không hợp lệ)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('authToken'); // Xóa token nếu không hợp lệ
      window.location.href = '/login'; // Chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

// Lấy danh sách sản phẩm trong giỏ hàng (cần token)
export const getCartItems = async () => {
  try {
    const response = await apiClient.get('/cart');
    return response.data; // Trả về danh sách Cart từ backend
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi lấy giỏ hàng');
  }
};

// Thêm sản phẩm vào giỏ hàng (cần token)
export const addToCart = async (cartItem) => {
  try {
    const response = await apiClient.post('/addCart', cartItem);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi thêm vào giỏ hàng');
  }
};

// Cập nhật số lượng (cần token)
export const updateCartQuantity = async (cartId, quantity) => {
  try {
    const response = await apiClient.put(`/cart/${cartId}`, { quantity });
    console.log('Phản hồi từ server:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data || 'Lỗi khi cập nhật số lượng';
    console.error('Lỗi API:', errorMessage);
    throw new Error(errorMessage);
  }
};

// Xóa sản phẩm khỏi giỏ hàng (cần token)
export const removeFromCart = async (cartId) => {
  try {
    await apiClient.delete(`/cart/${cartId}`);
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng');
  }
};

// Thanh toán giỏ hàng (cần token)
export const checkout = async () => {
  try {
    const response = await apiClient.post('/checkout');
    return response.data; // Trả về thông tin đơn hàng từ backend
  } catch (error) {
    const errorMessage = error.response?.data || 'Lỗi khi tạo đơn hàng';
    console.error('Lỗi khi thanh toán:', errorMessage);
    throw new Error(errorMessage);
  }
};