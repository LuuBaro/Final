// src/services/orderService.js
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
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getOrdersByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Lỗi khi lấy danh sách đơn hàng');
  }
};

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