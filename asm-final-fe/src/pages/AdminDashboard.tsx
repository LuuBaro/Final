import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Bell, MessageCircle, Settings, Moon, Sun, User, LogOut, NotebookPen } from 'lucide-react';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Định nghĩa kiểu dữ liệu
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface Order {
  id: number;
  name: string;
  date: string;
  status: 'Trả' | 'Chưa thanh toán' | 'Chưa giải quyết';
  total: number;
}

interface NewProduct {
  name: string;
  price: string; // Dùng string vì input type="number" trả về string
  category: string;
}

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newProduct, setNewProduct] = useState<NewProduct>({ name: '', price: '', category: '' });
  const [newCategory, setNewCategory] = useState<string>('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const location = useLocation();
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showMessages, setShowMessages] = useState<boolean>(false);

  // Dữ liệu giả lập
  useEffect(() => {
    setProducts([
      { id: 1, name: 'Máy tính xách tay HP Probook 450', price: 499, category: 'Bán điện tử', image: 'https://via.placeholder.com/50' },
      { id: 2, name: 'Điện thoại Samsung', price: 299, category: 'Bán điện tử', image: 'https://via.placeholder.com/50' },
    ]);
    setCategories(['Bán điện tử', 'Bán quần áo']);
    setOrders([
      { id: 1, name: 'Gói miễn phí', date: '13/01/2023', status: 'Trả', total: 0 },
      { id: 2, name: 'Gói điện tử', date: '13/01/2023', status: 'Trả', total: 59 },
      { id: 3, name: 'Gói kinh doanh', date: '13/01/2023', status: 'Chưa thanh toán', total: 99 },
      { id: 4, name: 'Gói điện tử', date: '13/01/2023', status: 'Chưa giải quyết', total: 59 },
    ]);
  }, []);

  // Thêm sản phẩm
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProducts([...products, {
      id: Date.now(), ...newProduct, price: parseFloat(newProduct.price),
      image: ''
    }]);
    setNewProduct({ name: '', price: '', category: '' });
    toast.success('Sản phẩm đã được thêm!');
  };

  // Sửa sản phẩm
  const handleEditProduct = (product: Product) => {
    setEditProduct(product);
    setNewProduct({ name: product.name, price: product.price.toString(), category: product.category });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProduct) {
      setProducts(products.map(p => p.id === editProduct.id ? { ...editProduct, ...newProduct, price: parseFloat(newProduct.price) } : p));
    }
    setEditProduct(null);
    setNewProduct({ name: '', price: '', category: '' });
    toast.success('Sản phẩm đã được cập nhật!');
  };

  // Xóa sản phẩm
  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      setProducts(products.filter(p => p.id !== id));
      toast.success('Sản phẩm đã bị xóa!');
    }
  };

  // Thêm loại sản phẩm
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      toast.success('Loại sản phẩm đã được thêm!');
    }
  };

  // Sửa loại sản phẩm
  const handleEditCategory = (category: string) => {
    setEditCategory(category);
    setNewCategory(category);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCategory && newCategory) {
      setCategories(categories.map(c => c === editCategory ? newCategory : c));
    }
    setEditCategory(null);
    setNewCategory('');
    toast.success('Loại sản phẩm đã được cập nhật!');
  };

  // Xóa loại sản phẩm
  const handleDeleteCategory = (category: string) => {
    if (window.confirm('Bạn có chắc muốn xóa loại sản phẩm này?')) {
      setCategories(categories.filter(c => c !== category));
      setProducts(products.filter(p => p.category !== category));
      toast.success('Loại sản phẩm đã bị xóa!');
    }
  };

  // Dữ liệu biểu đồ
  const chartData: ChartData<'bar', number[], string> = {
    labels: orders.map((o: Order) => o.name),
    datasets: [
      {
        label: 'Tổng tiền ($)',
        data: orders.map((o: Order) => o.total),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const, // Ép kiểu để TypeScript nhận diện đúng giá trị literal
      },
      title: {
        display: true,
        text: 'Thống kê đơn hàng',
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-gray-800 text-white p-4 space-y-6"
      >
        <h2 className="text-xl font-bold">Baro Fashion</h2>
        <ul>
          <li>
            <Link to="/admin/products" className={`block py-2 px-4 rounded ${location.pathname === '/admin/products' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
              Bảng điều khiển
            </Link>
          </li>
          <li>
            <Link to="/admin/categories" className={`block py-2 px-4 rounded ${location.pathname === '/admin/categories' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
              Loại sản phẩm
            </Link>
          </li>
          <li>
            <Link to="/admin/reports" className={`block py-2 px-4 rounded ${location.pathname === '/admin/reports' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
              Báo cáo thống kê
            </Link>
          </li>
          <li>
            <Link to="/admin/orders" className={`block py-2 px-4 rounded ${location.pathname === '/admin/orders' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
              Quản lý đơn hàng
            </Link>
          </li>
          <li>
            <Link to="/admin/users" className={`block py-2 px-4 rounded ${location.pathname === '/admin/users' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
              Người dùng
            </Link>
          </li>
          <li>
            <Link to="/admin/settings" className={`block py-2 px-4 rounded ${location.pathname === '/admin/settings' ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}>
              Cài đặt
            </Link>
          </li>
        </ul>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center bg-white p-4 rounded-lg shadow-lg"
        >
          {/* Thanh tìm kiếm */}
          <div className="flex items-center space-x-2 w-1/3">
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Nhập để tìm kiếm..."
              className="w-full p-2 outline-none bg-transparent text-gray-600"
            />
          </div>

          {/* Cài đặt & thông báo */}
          <div className="flex items-center space-x-4">
            {/* Toggle Light/Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200"
            >
              {darkMode ? <Sun className="w-5 h-5 text-gray-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>

            {/* Thông báo */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 relative"
              >
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-3">
                  <p className="text-gray-700 text-sm">Bạn có 3 thông báo mới</p>
                </div>
              )}
            </div>

            {/* Tin nhắn */}
            <div className="relative">
              <button
                onClick={() => setShowMessages(!showMessages)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 relative"
              >
                <MessageCircle className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {showMessages && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-3">
                  <p className="text-gray-700 text-sm">Bạn có 5 tin nhắn mới</p>
                </div>
              )}
            </div>

            {/* Avatar & Thông tin người dùng */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2"
              >
                <img
                  src="https://via.placeholder.com/40"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Thomas Anree</p>
                  <p className="text-gray-400 text-xs">Nhà thiết kế UX</p>
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
                  <button className="flex items-center w-full p-2 hover:bg-gray-100">
                    <User className="w-5 h-5 text-gray-500 mr-2" />
                    Hồ sơ của tôi
                  </button>
                  <button className="flex items-center w-full p-2 hover:bg-gray-100">
                    <NotebookPen className="w-5 h-5 text-gray-500 mr-2" />
                    Liên hệ của tôi
                  </button>
                  <button className="flex items-center w-full p-2 hover:bg-gray-100">
                    <Settings className="w-5 h-5 text-gray-500 mr-2" />
                    Cài đặt tài khoản
                  </button>
                  <button className="flex items-center w-full p-2 hover:bg-gray-100">
                    <LogOut className="w-5 h-5 text-red-500 mr-2" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <Routes>
          <Route
            path="/products"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <h2 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h2>
                <form onSubmit={handleAddProduct} className="mb-4">
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Tên sản phẩm"
                    className="p-2 border rounded mr-2"
                    required
                  />
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="Giá"
                    className="p-2 border rounded mr-2"
                    required
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="p-2 border rounded mr-2"
                    required
                  >
                    <option value="">Chọn loại</option>
                    {categories.map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                    Thêm sản phẩm
                  </button>
                </form>
                {editProduct && (
                  <form onSubmit={handleUpdateProduct} className="mb-4">
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="p-2 border rounded mr-2"
                      required
                    />
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="p-2 border rounded mr-2"
                      required
                    />
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="p-2 border rounded mr-2"
                      required
                    >
                      {categories.map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                      Cập nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditProduct(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded ml-2"
                    >
                      Hủy
                    </button>
                  </form>
                )}
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2">Tên</th>
                      <th className="p-2">Giá</th>
                      <th className="p-2">Loại</th>
                      <th className="p-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: Product) => (
                      <tr key={product.id} className="border-b">
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">${product.price}</td>
                        <td className="p-2">{product.category}</td>
                        <td className="p-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-600 text-white px-2 py-1 rounded"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            }
          />
          <Route
            path="/categories"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <h2 className="text-2xl font-bold mb-4">Quản lý loại sản phẩm</h2>
                <form onSubmit={handleAddCategory} className="mb-4">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Tên loại sản phẩm"
                    className="p-2 border rounded mr-2"
                    required
                  />
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                    Thêm loại
                  </button>
                </form>
                {editCategory && (
                  <form onSubmit={handleUpdateCategory} className="mb-4">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="p-2 border rounded mr-2"
                      required
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                      Cập nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCategory(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded ml-2"
                    >
                      Hủy
                    </button>
                  </form>
                )}
                <ul>
                  {categories.map((category: string) => (
                    <li key={category} className="flex justify-between items-center p-2 border-b">
                      <span>{category}</span>
                      <div>
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Xóa
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            }
          />
          <Route
            path="/reports"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <h2 className="text-2xl font-bold mb-4">Báo cáo thống kê</h2>
                <Bar data={chartData} options={chartOptions} />
              </motion.div>
            }
          />
          <Route
            path="/orders"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <h2 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h2>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2">Tên</th>
                      <th className="p-2">Ngày đặt</th>
                      <th className="p-2">Trạng thái</th>
                      <th className="p-2">Tổng tiền</th>
                      <th className="p-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: Order) => (
                      <tr key={order.id} className="border-b">
                        <td className="p-2">{order.name}</td>
                        <td className="p-2">{order.date}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded ${order.status === 'Chưa thanh toán' ? 'bg-red-200' : order.status === 'Chưa giải quyết' ? 'bg-yellow-200' : 'bg-green-200'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-2">${order.total}</td>
                        <td className="p-2">
                          <button className="bg-blue-600 text-white px-2 py-1 rounded mr-2">Xem</button>
                          <button className="bg-red-600 text-white px-2 py-1 rounded">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            }
          />
          <Route
            path="/users"
            element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="bg-white p-6 rounded-lg shadow"><h2>Quản lý người dùng</h2></motion.div>}
          />
          <Route
            path="/settings"
            element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="bg-white p-6 rounded-lg shadow"><h2>Cài đặt</h2></motion.div>}
          />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

export default AdminDashboard;