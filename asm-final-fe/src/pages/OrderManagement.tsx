import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Eye, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrders([
        { id: 1, name: 'Gói miễn phí', date: '13/01/2023', status: 'Trả', total: 0 },
        { id: 2, name: 'Gói điện tử', date: '13/01/2023', status: 'Trả', total: 59 },
        { id: 3, name: 'Gói kinh doanh', date: '13/01/2023', status: 'Chưa thanh toán', total: 99 },
        { id: 4, name: 'Gói điện tử', date: '13/01/2023', status: 'Chưa giải quyết', total: 59 },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleDeleteOrder = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      setOrders(orders.filter(o => o.id !== id));
      toast.success('Đơn hàng đã bị xóa!');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý đơn hàng</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-3">Tên</th>
              <th className="p-3">Ngày đặt</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3">{order.name}</td>
                <td className="p-3">{order.date}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'Chưa thanh toán'
                        ? 'bg-red-100 text-red-800'
                        : order.status === 'Chưa giải quyết'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3">${order.total}</td>
                <td className="p-3 space-x-2">
                  <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toaster />
    </motion.div>
  );
};

export default OrderManagement;