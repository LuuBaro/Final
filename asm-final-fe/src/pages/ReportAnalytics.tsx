import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import LoadingSpinner from '../components/LoadingSpinner';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReportAnalytics = () => {
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

  const chartData = {
    labels: orders.map(o => o.name),
    datasets: [
      {
        label: 'Tổng tiền ($)',
        data: orders.map(o => o.total),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Thống kê đơn hàng' },
    },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Báo cáo thống kê</h2>
      <Bar data={chartData} options={chartOptions} />
    </motion.div>
  );
};

export default ReportAnalytics;