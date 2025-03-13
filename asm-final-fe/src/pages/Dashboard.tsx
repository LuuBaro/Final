import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Truck, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        revenue: 103,
        products: 72,
        orders: 499,
        users: 124,
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-2"
    >
      <h2 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4"
        >
          <DollarSign className="w-10 h-10 text-green-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Doanh thu</h3>
            <p className="text-2xl font-bold text-gray-800">${stats.revenue}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4"
        >
          <ShoppingBag className="w-10 h-10 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Sản phẩm</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.products}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4"
        >
          <Truck className="w-10 h-10 text-yellow-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Đơn hàng</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.orders}</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4"
        >
          <Users className="w-10 h-10 text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Người dùng</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.users}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;