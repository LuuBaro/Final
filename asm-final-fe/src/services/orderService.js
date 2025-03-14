import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Đảm bảo khớp với backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const getToken = () => {
  return Cookies.get('authToken');
};

// Thêm interceptor để tự động gắn token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API lấy tất cả đơn hàng (dành cho admin)
export const getOrders = async () => {
  try {
    const response = await apiClient.get(''); // Từ OrderController: /api/orders
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi lấy danh sách đơn hàng');
  }
};

// API lấy đơn hàng theo userId (dành cho khách hàng)
export const getOrdersByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/user/${userId}`); // Từ OrderController: /api/user/{userId}
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi lấy danh sách đơn hàng');
  }
};

// API hủy đơn hàng (khách hàng)
export const cancelOrder = async (orderId, taskId = null) => {
  try {
    const params = { orderId };
    if (taskId) params.taskId = taskId;
    const response = await apiClient.put('/orders/cancel-order', null, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi hủy đơn hàng');
  }
};

// API xóa đơn hàng (khách hàng)
export const deleteOrder = async (orderId, taskId = null) => {
  try {
    const params = { orderId };
    if (taskId) params.taskId = taskId;
    const response = await apiClient.put('/orders/delete-order', null, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi xóa đơn hàng');
  }
};

// API xác nhận đơn hàng (admin)
export const approveOrder = async (orderId, taskId = null) => {
  try {
    const params = { orderId };
    if (taskId) params.taskId = taskId;
    const response = await apiClient.put('/orders/approve-order', null, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi xác nhận đơn hàng');
  }
};

// API duyệt kho (admin)
export const approveStock = async (orderId) => {
  try {
    const response = await apiClient.put('/orders/approve-stock', null, {
      params: { orderId },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi duyệt kho');
  }
};

// API từ chối kho (admin)
export const rejectStock = async (orderId) => {
  try {
    const response = await apiClient.put('/orders/reject-stock', null, {
      params: { orderId },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi từ chối kho');
  }
};

// API xác nhận thanh toán thành công (admin)
export const completePaymentSuccess = async (orderId) => {
  try {
    const response = await apiClient.put('/orders/complete-payment-success', null, {
      params: { orderId },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi xác nhận thanh toán thành công');
  }
};

// API xác nhận thanh toán thất bại (admin)
export const completePaymentFailure = async (orderId) => {
  try {
    const response = await apiClient.put('/orders/complete-payment-failure', null, {
      params: { orderId },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi xác nhận thanh toán thất bại');
  }
};