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

// Lấy token từ cookie
const getToken = () => {
  return Cookies.get('authToken'); // Token được lưu trong cookie với key 'authToken'
};

// Interceptor để thêm token vào header cho tất cả các yêu cầu
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
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

// Hàm lấy dữ liệu báo cáo (cần token)
export const getReport = async (fromDate, toDate, status) => {
  try {
    const response = await apiClient.get('/report', {
      params: {
        fromDate,
        toDate,
        status: status === 'ALL' ? null : status,
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

// Hàm xuất báo cáo (cần token)
export const exportReport = async (format, fromDate, toDate, status) => {
  try {
    const response = await apiClient.get(`/export/${format}`, {
      params: {
        fromDate,
        toDate,
        status: status === 'ALL' ? null : status,
      },
      responseType: 'blob', // Để xử lý file tải xuống
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