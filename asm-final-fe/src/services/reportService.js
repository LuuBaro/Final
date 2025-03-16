// src/services/reportService.js
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

// Hàm lấy dữ liệu báo cáo
export const getReport = async (fromDate, toDate, status) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No token found. Vui lòng đăng nhập để xem báo cáo.');
  }

  try {
    const response = await apiClient.get('/report', {
      params: {
        fromDate,
        toDate,
        status: status === 'ALL' ? null : status,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền truy cập báo cáo. Vui lòng đăng nhập với tài khoản Admin.');
    }
    throw new Error(error.response?.data?.message || 'Không thể tải dữ liệu báo cáo!');
  }
};

// Hàm xuất báo cáo
export const exportReport = async (format, fromDate, toDate, status) => {
  const token = Cookies.get('authToken');
  if (!token) {
    throw new Error('No token found. Vui lòng đăng nhập để xuất báo cáo.');
  }

  try {
    const response = await apiClient.get(`/export/${format}`, {
      params: {
        fromDate,
        toDate,
        status: status === 'ALL' ? null : status,
      },
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.log('Full error:', error.response);
    if (error.response?.status === 403) {
      throw new Error('Bạn không có quyền xuất báo cáo. Vui lòng đăng nhập với tài khoản Admin.');
    }
    throw new Error(error.response?.data?.message || `Không thể xuất báo cáo ${format}!`);
  }
};

export default { getReport, exportReport }; // Export default object chứa các phương thức