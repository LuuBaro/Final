import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Download } from 'lucide-react';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReportAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const validDate = searchDate && /^\d{4}-\d{2}-\d{2}$/.test(searchDate) && !searchDate.includes(':') ? searchDate : null;
        const response = await axios.get('http://localhost:8080/api/report', {
          params: { date: validDate, status: statusFilter === 'ALL' ? null : statusFilter },
        });
        if (response.data && response.data.length > 0 && response.data[0].userName?.includes('Database error')) {
          setErrorMessage(response.data[0].userName);
          setOrders([]);
        } else {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu báo cáo:', error);
        setErrorMessage('Không thể tải dữ liệu báo cáo. Vui lòng thử lại.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [searchDate, statusFilter]);

  const exportReport = async (format) => {
    try {
        setErrorMessage('');
        const validDate = searchDate && /^\d{4}-\d{2}-\d{2}$/.test(searchDate) && !searchDate.includes(':') ? searchDate : null;
        const response = await axios.get(`http://localhost:8080/api/export/${format}`, {
            params: { date: validDate, status: statusFilter === 'ALL' ? null : statusFilter },
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const fileExtension = format === 'excel' ? 'xlsx' : 'pdf'; // Đảm bảo đuôi .xlsx
        const currentDate = new Date().toISOString().slice(0, 10);
        link.setAttribute('download', `report_${currentDate}.${fileExtension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error(`Lỗi khi xuất báo cáo ${format}:`, error);
        if (error.response && error.response.data) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const errorJson = JSON.parse(reader.result);
                    setErrorMessage(errorJson.error || `Không thể xuất báo cáo ${format}.`);
                } catch (e) {
                    setErrorMessage(`Không thể xuất báo cáo ${format}. Vui lòng thử lại.`);
                }
            };
            reader.readAsText(error.response.data);
        } else {
            setErrorMessage(`Không thể xuất báo cáo ${format}. Vui lòng thử lại.`);
        }
    }
};

  const barChartData = {
    labels: [...new Set(orders.flatMap(o => o.items?.map(i => i.productName) || []))],
    datasets: [
      {
        label: 'Tổng tiền (VND)',
        data: [...new Set(orders.flatMap(o => o.items?.map(i => i.productName) || []))].map(productName =>
          orders
            .flatMap(o => o.items || [])
            .filter(i => i.productName === productName)
            .reduce((sum, i) => sum + Number(i.subtotal || 0), 0)
        ),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tổng tiền theo sản phẩm' },
    },
  };

  const pieStatusData = {
    labels: [...new Set(orders.map(o => o.status || 'Không xác định'))],
    datasets: [
      {
        label: 'Số lượng',
        data: [...new Set(orders.map(o => o.status || 'Không xác định'))].map(status =>
          orders.filter(o => o.status === status).length
        ),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieStatusOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tỷ lệ trạng thái đơn hàng' },
    },
  };

  const pieProductData = {
    labels: [...new Set(orders.flatMap(o => o.items?.map(i => i.productName) || []))],
    datasets: [
      {
        label: 'Số lượng',
        data: [...new Set(orders.flatMap(o => o.items?.map(i => i.productName) || []))].map(productName =>
          orders.flatMap(o => o.items || []).filter(i => i.productName === productName).length
        ),
        backgroundColor: [
          'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieProductOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Tỷ lệ sản phẩm trong đơn hàng' },
    },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Báo cáo thống kê</h2>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CANCELED">Đã hủy</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="FAILED">Thanh toán thất bại</option>
            <option value="APPROVED">Đang giao hàng</option>
            <option value="DELETED">Đã xóa</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('excel')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
          >
            <Download className="w-5 h-5" /> Excel
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600"
          >
            <Download className="w-5 h-5" /> PDF
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <Pie data={pieStatusData} options={pieStatusOptions} />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <Pie data={pieProductData} options={pieProductOptions} />
          </div>
        </div>
      )}

      {orders.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="p-3">Mã đơn</th>
                <th className="p-3">Khách hàng</th>
                <th className="p-3">Ngày đặt</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Tổng tiền (VND)</th>
                <th className="p-3">Sản phẩm</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">{order.id || 'N/A'}</td>
                  <td className="p-3">{order.userName || 'N/A'}</td>
                  <td className="p-3">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="p-3">{order.status || 'N/A'}</td>
                  <td className="p-3">
                    {order.totalAmount ? Number(order.totalAmount).toLocaleString('vi-VN') : 'N/A'}
                  </td>
                  <td className="p-3">
                    {order.items?.map(i => `${i.productName} (x${i.quantity})`).join(', ') || 'N/A'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !errorMessage && (
          <div className="text-center text-gray-500 mt-6">Không có dữ liệu để hiển thị.</div>
        )
      )}
    </motion.div>
  );
};

export default ReportAnalytics;