import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Search, CheckCircle, XCircle, Ban, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import BpmnDiagram from '../pages/BpmnDiagram'; // Import component mới
import {
  getOrders,
  approveOrder,
  approveStock,
  rejectStock,
  completePaymentSuccess,
  completePaymentFailure,
  cancelOrder,
} from '../services/orderService';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bpmnXml, setBpmnXml] = useState(null); // State để lưu BPMN XML
  const itemsPerPage = 5;
  const processDefinitionId = 'orderProcess:2:626bc717-05c2-11f0-9ccc-088fc3618e8d';
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
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
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchOrders();
  
        const response = await fetch(
          `http://localhost:8080/engine-rest/process-definition/${processDefinitionId}/xml`
        );
        if (!response.ok) throw new Error('Không thể lấy sơ đồ BPMN');
        const data = await response.json();
        console.log('bpmn20Xml từ API:', data.bpmn20Xml); // Log để kiểm tra
        setBpmnXml(data.bpmn20Xml);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const translateStatus = (status) => {
    const statusMap = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      CANCELED: 'Đã hủy',
      PAID: 'Chờ thanh toán',
      FAILED: 'Thất bại',
      DELETED: 'Đã xóa',
      APPROVED: 'Đang giao hàng',
    };
    return statusMap[status] || status;
  };

  const handleCancelOrder = async (orderId) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="mb-4">Bạn có chắc muốn hủy đơn hàng này?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                try {
                  await cancelOrder(orderId);
                  toast.success('Đơn hàng đã được hủy!');
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

  const handleApproveOrder = async (orderId) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="mb-4">Xác nhận đơn hàng này?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                try {
                  await approveOrder(orderId);
                  toast.success('Đơn hàng đã được xác nhận!');
                  await fetchOrders();
                  toast.dismiss(t.id);
                } catch (error) {
                  toast.error(error.message);
                  toast.dismiss(t.id);
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
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

  const handleApproveStock = async (orderId) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="mb-4">Xác nhận đủ hàng trong kho?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                try {
                  await approveStock(orderId);
                  toast.success('Đã xác nhận đủ hàng, chờ thanh toán!');
                  await fetchOrders();
                  toast.dismiss(t.id);
                } catch (error) {
                  toast.error(error.message);
                  toast.dismiss(t.id);
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
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

  const handleRejectStock = async (orderId) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="mb-4">Từ chối đơn hàng do không đủ hàng?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                try {
                  await rejectStock(orderId);
                  toast.success('Đơn hàng đã bị hủy do không đủ hàng!');
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

  const handleCompletePaymentSuccess = async (orderId) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="mb-4">Xác nhận thanh toán thành công và bắt đầu giao hàng?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                try {
                  await completePaymentSuccess(orderId);
                  toast.success('Đơn hàng đã được duyệt và bắt đầu giao hàng!');
                  await fetchOrders();
                  toast.dismiss(t.id);
                } catch (error) {
                  toast.error(error.message);
                  toast.dismiss(t.id);
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
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

  const handleCompletePaymentFailure = async (orderId) => {
    toast(
      (t) => (
        <div className="text-center">
          <p className="mb-4">Xác nhận thanh toán thất bại và hủy đơn hàng?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                try {
                  await completePaymentFailure(orderId);
                  toast.success('Đơn hàng đã bị hủy do thanh toán thất bại!');
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

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const searchedOrders = orders.filter((order) => order.id.toLowerCase().includes(term));
    filterOrdersByTab(activeTab, searchedOrders);
    setCurrentPage(1);
  };

  const filterOrdersByTab = (tab, ordersList = orders) => {
    let filtered = ordersList;
    if (tab === 'ALL') {
      filtered = ordersList.filter((order) => order.status !== 'DELETED');
    } else {
      filtered = ordersList.filter((order) => order.status === tab);
    }
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    filterOrdersByTab(tab);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý đơn hàng</h2>

      {/* Hiển thị sơ đồ BPMN */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Sơ đồ quy trình đặt hàng</h3>
        {bpmnXml ? (
          <BpmnDiagram bpmnXml={bpmnXml} processDefinitionId={processDefinitionId} />
        ) : (
          <p className="text-gray-500">Đang tải sơ đồ...</p>
        )}
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-1/3">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Tìm kiếm mã đơn hàng..."
            className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-10"
          />
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-500" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8 flex justify-start space-x-2 flex-wrap gap-2"
      >
        {[
          'PENDING',
          'CONFIRMED',
          'PAID',
          'APPROVED',
          'CANCELED',
          'FAILED',
          'DELETED',
          'ALL',
        ].map((tab) => (
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

      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-gray-600"
        >
          Không tìm thấy đơn hàng nào.
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto"
        >
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="py-3 px-6 text-left">Mã đơn hàng</th>
                <th className="py-3 px-6 text-left">Khách hàng</th>
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
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-4 px-6 text-indigo-600 font-medium">{order.id}</td>
                  <td className="py-4 px-6 text-gray-600">{order.user.name}</td>
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
                          ? 'bg-teal-100 text-teal-800'
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
                  <td className="py-4 px-6 space-x-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApproveOrder(order.id)}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                          title="Xác nhận đơn hàng"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          title="Hủy đơn hàng"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => handleApproveStock(order.id)}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                          title="Duyệt kho"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRejectStock(order.id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          title="Từ chối kho"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {order.status === 'PAID' && (
                      <>
                        <button
                          onClick={() => handleCompletePaymentSuccess(order.id)}
                          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                          title="Thanh toán thành công"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleCompletePaymentFailure(order.id)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                          title="Thanh toán thất bại"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {order.items && order.items.length > 0 && (
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Trước
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal chi tiết đơn hàng */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeOrderDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeOrderDetails}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-semibold text-indigo-800 mb-4">
                Chi tiết đơn hàng #{selectedOrder.id.slice(0, 8)}
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600 font-medium">Khách hàng:</span>
                  <span className="text-gray-800">{selectedOrder.user.name}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600 font-medium">Ngày đặt:</span>
                  <span className="text-gray-800">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600 font-medium">Tổng tiền:</span>
                  <span className="text-indigo-600 font-semibold">
                    {selectedOrder.totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Sản phẩm:</h4>
                  <ul className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.3 }}
                        className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Số lượng: {item.quantity} | Giá: {item.price.toLocaleString('vi-VN')} đ
                          </p>
                          <p className="text-sm font-bold text-indigo-600">
                            Tổng: {item.subtotal.toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster />
    </motion.div>
  );
};

export default OrderManagement;