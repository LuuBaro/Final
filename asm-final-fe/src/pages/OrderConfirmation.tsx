import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order; // Lấy dữ liệu order từ state

  const handleViewOrder = () => {
    navigate('/orders'); // Điều hướng đến trang đơn hàng của user
  };

  const handleGoBack = () => {
    navigate('/products'); // Điều hướng đến trang sản phẩm
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-indigo-600 mb-4"
        >
          Đặt hàng thành công!
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-gray-600 mb-6"
        >
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận.
        </motion.p>
        {order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-6"
          >
            <p className="text-lg font-medium">
              Mã đơn hàng: <span className="text-indigo-600">{order.id}</span>
            </p>
            <p className="text-lg font-medium">
              Trạng thái: <span className="text-indigo-600">{order.status}</span>
            </p>
            <p className="text-lg font-medium">
              Tổng tiền:{' '}
              <span className="text-indigo-600">{order.totalAmount?.toLocaleString('vi-VN')} đ</span>
            </p>
          </motion.div>
        )}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex justify-center gap-4"
        >
          <button
            onClick={handleViewOrder}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={handleGoBack}
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
          >
            Quay lại mua sắm
          </button>
        </motion.div>
      </motion.div>
      <Toaster />
    </div>
  );
}