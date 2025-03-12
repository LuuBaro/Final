import axios from 'axios';

// Tạo instance axios với base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000, // Thời gian chờ tối đa (10 giây)
  headers: {
    'Content-Type': 'application/json',
    // Thêm header Authorization nếu cần (ví dụ: token)
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
});

// Hàm lấy danh sách sản phẩm
export const getProducts = async () => {
  try {
    const response = await apiClient.get('/products');
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error('Lỗi khi gọi API lấy sản phẩm:', error);
    throw error; // Ném lỗi để xử lý ở component
  }
};

// (Tùy chọn) Thêm các hàm khác nếu cần (ví dụ: getProductById, createProduct, etc.)