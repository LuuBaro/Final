import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Tạo instance axios với base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000, // Thời gian chờ tối đa (10 giây)
});

// Hàm để lấy Bearer Token từ Cookies
const getToken = () => {
  const token = Cookies.get('authToken');
  if (!token) {
    console.warn('Không tìm thấy token trong Cookies!');
    return null;
  }
  try {
    // Kiểm tra token có hợp lệ không (ví dụ: chưa hết hạn)
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn('Token đã hết hạn!');
      Cookies.remove('authToken'); // Xóa token hết hạn
      return null;
    }
    return token;
  } catch (error) {
    console.error('Lỗi khi giải mã token:', error.message);
    Cookies.remove('authToken'); // Xóa token không hợp lệ
    return null;
  }
};

// Interceptor để thêm token vào header và xử lý Content-Type
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    // Thêm token vào header cho các yêu cầu POST, PUT, DELETE
    if (token && ['post', 'put', 'delete'].includes(config.method)) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Nếu gửi multipart/form-data, không set Content-Type thủ công (axios tự xử lý)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    console.error('Lỗi trong request interceptor:', error.message);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi từ response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || error.response?.data || 'Đã xảy ra lỗi không xác định!';
    console.error(`Lỗi từ server (${error.response?.status}):`, errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Hàm lấy danh sách sản phẩm (không cần token)
export const getProducts = async () => {
  try {
    console.log('Bắt đầu lấy danh sách sản phẩm');
    const response = await apiClient.get('/products');
    console.log('Lấy danh sách sản phẩm thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error.message);
    throw new Error(error.message || 'Không thể lấy danh sách sản phẩm!');
  }
};

// Hàm lấy danh sách danh mục (không cần token)
export const getCategories = async () => {
  try {
    console.log('Bắt đầu lấy danh sách danh mục');
    const response = await apiClient.get('/categories');
    console.log('Lấy danh sách danh mục thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error.message);
    throw new Error(error.message || 'Không thể lấy danh sách danh mục!');
  }
};

// Hàm thêm sản phẩm mới (cần token, hỗ trợ upload ảnh)
export const addProduct = async (productData, imageFile) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để thêm sản phẩm!');
    }

    console.log('Bắt đầu thêm sản phẩm mới:', productData);

    // Tạo FormData để gửi dữ liệu dạng multipart/form-data
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('categoryId', productData.categoryId);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    if (imageFile) {
      formData.append('image', imageFile); // Thêm file ảnh nếu có
      console.log('Thêm file ảnh:', imageFile.name);
    }

    const response = await apiClient.post('/products', formData);
    console.log('Thêm sản phẩm thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm:', error.message);
    throw new Error(error.message || 'Không thể thêm sản phẩm!');
  }
};

// Hàm cập nhật sản phẩm (cần token, hỗ trợ upload ảnh mới)
export const updateProduct = async (id, productData, imageFile) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để cập nhật sản phẩm!');
    }

    console.log('Bắt đầu cập nhật sản phẩm:', { id, productData });

    // Tạo FormData để gửi dữ liệu dạng multipart/form-data
    const formData = new FormData();
    if (productData.name) formData.append('name', productData.name);
    if (productData.categoryId) formData.append('categoryId', productData.categoryId);
    if (productData.price) formData.append('price', productData.price);
    if (productData.stock) formData.append('stock', productData.stock);
    if (imageFile) {
      formData.append('image', imageFile); // Thêm file ảnh nếu có
      console.log('Thêm file ảnh mới:', imageFile.name);
    }

    const response = await apiClient.put(`/products/${id}`, formData);
    console.log('Cập nhật sản phẩm thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error.message);
    throw new Error(error.message || 'Không thể cập nhật sản phẩm!');
  }
};

// Hàm xóa sản phẩm (cần token)
export const deleteProduct = async (id) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để xóa sản phẩm!');
    }

    console.log('Bắt đầu xóa sản phẩm:', id);
    await apiClient.delete(`/products/${id}`);
    console.log('Xóa sản phẩm thành công:', id);
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error.message);
    throw new Error(error.message || 'Không thể xóa sản phẩm!');
  }
};

// Hàm import sản phẩm từ file Excel (cần token)
export const importProductsFromExcel = async (file) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Bạn cần đăng nhập để import sản phẩm!');
    }

    console.log('Bắt đầu import sản phẩm từ file Excel:', file.name, file.size, file.type);
    const formData = new FormData();
    formData.append('file', file); // Thêm file vào form-data

    const response = await apiClient.post('/products/import', formData);
    console.log('Import sản phẩm thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi import sản phẩm:', error.message);
    throw new Error(error.message || 'Không thể import sản phẩm!');
  }
};