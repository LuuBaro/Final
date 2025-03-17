// src/services/productService.js
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
// Tạo instance axios với base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000, // Thời gian chờ tối đa (10 giây)
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

// Hàm lấy danh sách sản phẩm (không cần token)
export const getProducts = async () => {
  try {
    const response = await apiClient.get('/products');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể lấy danh sách sản phẩm!');
  }
};

// Hàm lấy danh sách danh mục (không cần token)
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể lấy danh sách danh mục!');
  }
};

// Hàm thêm sản phẩm mới (cần token)
export const addProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể thêm sản phẩm!');
  }
};

// Hàm cập nhật sản phẩm (cần token)
export const updateProduct = async (id, productData) => {
  try {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể cập nhật sản phẩm!');
  }
};

// Hàm xóa sản phẩm (cần token)
export const deleteProduct = async (id) => {
  try {
    await apiClient.delete(`/products/${id}`);
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể xóa sản phẩm!');
  }
};

// Hàm import sản phẩm từ file Excel (cần token)
export const importProductsFromExcel = async (file) => {
  const token = getToken();
  if (!token) {
    console.log('Token', token);
    throw new Error('Bạn cần đăng nhập để import sản phẩm!');
  }
  console.log('File to upload:', file.name, file.size, file.type);

  const formData = new FormData();
  formData.append('file', file); // Thêm file vào form-data
  try {
    const response = await apiClient.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Quan trọng khi gửi file
        'Authorization': `Bearer ${token}`, // Thêm thủ công
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Không thể import sản phẩm!');
  }
};