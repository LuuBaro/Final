import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { getOrdersByUserId, cancelOrder, deleteOrder } from '../services/orderService';

export default function Orders() {
  const { user } = useStore();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('ALL');
  const itemsPerPage = 5;

  // Hàm lấy danh sách đơn hàng từ API
  const fetchOrders = async () => {
    if (user && user.id) {
      try {
        const data = await getOrdersByUserId(user.id);
        const sortedData = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedData);
        filterOrdersByTab(activeTab, sortedData);
      } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error.message);
        toast.error(error.message);
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Hàm dịch trạng thái sang tiếng Việt
  const translateStatus = (status) => {
    const statusMap = {
      PENDING: 'Chờ xử lý',
      CONFIRMED: 'Đã xác nhận',
      CANCELED: 'Đã hủy',
      PAID: 'Đã thanh toán',
      FAILED: 'Thanh toán thất bại',
      DELETED: 'Đã xóa',
      APPROVED: 'Đang giao hàng', // Thêm trạng thái APPROVED
    };
    return statusMap[status] || status;
  };

  // Xử lý hủy đơn hàng với toast confirm
  const handleCancelOrder = (orderId) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="mb-4">Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                try {
                  await cancelOrder(orderId);
                  toast.success('Đơn hàng đã được hủy thành công!');
                  await fetchOrders();
                  toast.dismiss(t.id);
                } catch (error) {
                  toast.error(error.message);
                  toast.dismiss(t.id);
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Có
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Không
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  // Xử lý xóa đơn hàng với toast confirm
  const handleDeleteOrder = (orderId) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="mb-4">Bạn có chắc chắn muốn xóa đơn hàng này không?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                try {
                  await deleteOrder(orderId);
                  toast.success('Đơn hàng đã được xóa thành công!');
                  await fetchOrders();
                  toast.dismiss(t.id);
                } catch (error) {
                  toast.error(error.message);
                  toast.dismiss(t.id);
                }
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Có
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Không
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const searchedOrders = orders.filter((order) => order.id.toLowerCase().includes(term));
    filterOrdersByTab(activeTab, searchedOrders);
    setCurrentPage(1);
  };

  // Lọc đơn hàng theo tab
  const filterOrdersByTab = (tab, ordersList = orders) => {
    let filtered = ordersList;
    if (tab === 'ALL') {
      filtered = ordersList.filter((order) => order.status !== 'DELETED'); // Loại trừ DELETED khỏi tab ALL
    } else {
      filtered = ordersList.filter((order) => order.status === tab);
    }
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Xử lý khi chọn tab
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    filterOrdersByTab(tab);
  };

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (!user) {
    return (
      <div className="py-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center"
        >
          <h1 className="text-3xl font-bold text-indigo-600 mb-4">Đơn hàng</h1>
          <p className="text-gray-600 mb-8">Vui lòng đăng nhập để xem đơn hàng của bạn.</p>
          <Link
            to="/login"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Đăng nhập
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-indigo-600 mb-6 text-center"
        >
          Đơn hàng của bạn
        </motion.h1>

        {/* Ô tìm kiếm */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 flex justify-center"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Tìm kiếm mã đơn hàng..."
            className="w-full max-w-md px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </motion.div>

        {/* Tabs lọc trạng thái */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 flex justify-center space-x-2 flex-wrap gap-2"
        >
          {['ALL', 'PENDING', 'CONFIRMED', 'PAID', 'APPROVED', 'FAILED', 'CANCELED', 'DELETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-indigo-100'
              }`}
            >
              {tab === 'ALL' ? 'Tất cả' : translateStatus(tab)}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600"
          >
            Đang tải đơn hàng...
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-gray-600 mb-8">Không tìm thấy đơn hàng nào.</p>
            <Link
              to="/products"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors shadow-md"
            >
              Tiếp tục mua sắm
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="overflow-x-auto"
          >
            <table className="min-w-full bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="py-3 px-6 text-left">Mã đơn hàng</th>
                  <th className="py-3 px-6 text-left">Ngày đặt</th>
                  <th className="py-3 px-6 text-left">Trạng thái</th>
                  <th className="py-3 px-6 text-left">Tổng tiền</th>
                  <th className="py-3 px-6 text-left">Hành động</th>
                  <th className="py-3 px-6 text-left">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border-b hover:bg-gray-50 relative"
                  >
                    <td className="py-4 px-6 text-indigo-600 font-medium">{order.id}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'CANCELED'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'PAID'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'APPROVED'
                            ? 'bg-teal-100 text-teal-800' // Màu cho APPROVED
                            : order.status === 'FAILED'
                            ? 'bg-gray-100 text-gray-800'
                            : order.status === 'DELETED'
                            ? 'bg-gray-300 text-gray-900'
                            : ''
                        }`}
                      >
                        {translateStatus(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-indigo-600 font-medium">
                      {order.totalAmount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-4 px-6">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors shadow-md"
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                      {(order.status === 'CANCELED' || order.status === 'FAILED') && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors shadow-md"
                        >
                          Xóa đơn hàng
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {order.items && order.items.length > 0 && (
                        <div className="relative group">
                          <button className="text-indigo-600 hover:underline font-medium relative z-10">
                            Xem chi tiết
                          </button>
                          <motion.div
                            initial={{ opacity: 0, y: 20, rotateX: -10 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, y: 20, rotateX: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="absolute top-full mt-2 right-0 w-96 bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl shadow-xl z-20 max-h-[80vh] overflow-y-auto border border-indigo-100 group-hover:block hidden transform-gpu"
                          >
                            <div className="relative">
                              <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs">
                                  #{order.id.slice(0, 8)}
                                </span>
                                Chi tiết đơn hàng
                              </h3>
                              <ul className="space-y-5">
                                {order.items.map((item, idx) => (
                                  <motion.li
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                                    className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <div className="relative">
                                      <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="w-16 h-16 object-cover rounded-md"
                                      />
                                      <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                        {item.quantity}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-800 text-sm truncate">
                                        {item.product.name}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        Giá: {item.price.toLocaleString('vi-VN')} đ
                                      </p>
                                      <p className="text-sm font-bold text-indigo-600 mt-1">
                                        Tổng: {item.subtotal.toLocaleString('vi-VN')} đ
                                      </p>
                                    </div>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Phân trang */}
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full disabled:bg-gray-400 hover:bg-indigo-700 transition-colors shadow-md"
              >
                Trước
              </button>
              <span className="text-gray-600 font-medium">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full disabled:bg-gray-400 hover:bg-indigo-700 transition-colors shadow-md"
              >
                Sau
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Link
            to="/products"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors shadow-md"
          >
            Quay lại mua sắm
          </Link>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}