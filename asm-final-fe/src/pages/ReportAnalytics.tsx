import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Download, Eye } from 'lucide-react';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReportAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [errorMessage, setErrorMessage] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null); // Để hiển thị chi tiết đơn hàng
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const validFromDate = fromDate && /^\d{4}-\d{2}-\d{2}$/.test(fromDate) ? fromDate : null;
        const validToDate = toDate && /^\d{4}-\d{2}-\d{2}$/.test(toDate) ? toDate : null;
        const response = await axios.get('http://localhost:8080/api/report', {
          params: { 
            fromDate: validFromDate, 
            toDate: validToDate, 
            status: statusFilter === 'ALL' ? null : statusFilter 
          },
        });
        if (response.data && response.data.length > 0 && response.data[0].userName?.includes('Database error')) {
          setErrorMessage(response.data[0].userName);
          setOrders([]);
          setTotalRevenue(0);
        } else {
          setOrders(response.data);
          setFilteredOrders(response.data);
          const revenue = response.data.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
          setTotalRevenue(revenue);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu báo cáo:', error);
        setErrorMessage('Không thể tải dữ liệu báo cáo. Vui lòng thử lại.');
        setOrders([]);
        setTotalRevenue(0);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [fromDate, toDate, statusFilter]);

  useEffect(() => {
    const filtered = orders.filter(order => 
      (order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
       order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       order.products?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, orders]);

  const exportReport = async (format) => {
    try {
      setErrorMessage('');
      const validFromDate = fromDate && /^\d{4}-\d{2}-\d{2}$/.test(fromDate) ? fromDate : null;
      const validToDate = toDate && /^\d{4}-\d{2}-\d{2}$/.test(toDate) ? toDate : null;
      const response = await axios.get(`http://localhost:8080/api/export/${format}`, {
        params: { 
          fromDate: validFromDate, 
          toDate: validToDate, 
          status: statusFilter === 'ALL' ? null : statusFilter 
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileExtension = format === 'excel' ? 'xlsx' : 'pdf';
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
          const errorText = reader.result;
          try {
            const errorJson = JSON.parse(errorText);
            setErrorMessage(`Không thể xuất báo cáo ${format}: ${errorJson.error}`);
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

  // Biểu đồ cột (Doanh thu theo ngày) - Đã tối ưu
  const barChartData = {
    labels: [...new Set(orders.map(o => new Date(o.createdAt).toLocaleDateString('vi-VN')))],
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: [...new Set(orders.map(o => new Date(o.createdAt).toLocaleDateString('vi-VN')))].map(date =>
          orders
            .filter(o => new Date(o.createdAt).toLocaleDateString('vi-VN') === date)
            .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
        ),
        backgroundColor: 'rgba(75, 192, 192, 0.8)', // Màu xanh nhạt hơn để dễ nhìn
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barThickness: 20, // Giảm độ dày cột để cân bằng
        maxBarThickness: 30,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Cho phép điều chỉnh tỷ lệ
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Doanh thu theo ngày', font: { size: 16 } },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toLocaleString('vi-VN')} VND`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 12 }, // Giảm kích thước chữ trục x để tránh chồng lấn
          maxRotation: 0, // Không xoay nhãn
          minRotation: 0,
        },
        grid: {
          display: false, // Ẩn lưới trục x để gọn gàng
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString('vi-VN'),
          maxTicksLimit: 6, // Giới hạn số lượng nhãn trên trục y để cân bằng
          font: { size: 12 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)', // Lưới mờ để dễ nhìn
        },
        suggestedMax: Math.max(...barChartData.datasets[0].data) * 1.2, // Tối đa 120% giá trị lớn nhất
      },
    },
  };

  // Biểu đồ tròn (Tỷ lệ trạng thái đơn hàng)
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
      title: { display: true, text: 'Tỷ lệ trạng thái đơn hàng', font: { size: 16 } },
    },
  };

  // Biểu đồ tròn (Tỷ lệ sản phẩm)
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
      title: { display: true, text: 'Tỷ lệ sản phẩm trong đơn hàng', font: { size: 16 } },
    },
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

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
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 border rounded-lg w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 border rounded-lg w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      {orders.length > 0 && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
          <h3 className="text-lg font-semibold">Tổng doanh thu: {totalRevenue.toLocaleString('vi-VN')} VND</h3>
        </div>
      )}

      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow h-64"> {/* Đặt chiều cao cố định */}
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow h-64">
            <Pie data={pieStatusData} options={pieStatusOptions} />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow h-64">
            <Pie data={pieProductData} options={pieProductOptions} />
          </div>
        </div>
      )}

      {orders.length > 0 ? (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mã đơn, khách hàng, sản phẩm..."
              className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="p-4 font-semibold">Mã đơn</th>
                  <th className="p-4 font-semibold">Khách hàng</th>
                  <th className="p-4 font-semibold">Ngày đặt</th>
                  <th className="p-4 font-semibold">Trạng thái</th>
                  <th className="p-4 font-semibold">Tổng tiền (VND)</th>
                  <th className="p-4 font-semibold">Sản phẩm</th>
                  <th className="p-4 font-semibold">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="p-4">{order.id || 'N/A'}</td>
                    <td className="p-4">{order.userName || 'N/A'}</td>
                    <td className="p-4">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="p-4">{order.status || 'N/A'}</td>
                    <td className="p-4">
                      {order.totalAmount ? Number(order.totalAmount).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="p-4">{order.products || 'N/A'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
            >
              Trang trước
            </button>
            <span className="text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
            >
              Trang sau
            </button>
          </div>
        </>
      ) : (
        !errorMessage && (
          <div className="text-center text-gray-500 mt-6">Không có dữ liệu để hiển thị.</div>
        )
      )}

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
          >
            <h3 className="text-xl font-bold mb-4">Chi tiết đơn hàng: {selectedOrder.id}</h3>
            <div className="mb-4">
              <p><strong>Khách hàng:</strong> {selectedOrder.userName || 'N/A'}</p>
              <p><strong>Ngày đặt:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
              <p><strong>Trạng thái:</strong> {selectedOrder.status || 'N/A'}</p>
              <p><strong>Tổng tiền:</strong> {selectedOrder.totalAmount ? Number(selectedOrder.totalAmount).toLocaleString('vi-VN') : 'N/A'} VND</p>
            </div>
            <h4 className="text-lg font-semibold mb-2">Sản phẩm</h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 font-semibold">Tên sản phẩm</th>
                  <th className="p-3 font-semibold">Số lượng</th>
                  <th className="p-3 font-semibold">Đơn giá (VND)</th>
                  <th className="p-3 font-semibold">Thành tiền (VND)</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{item.productName || 'N/A'}</td>
                    <td className="p-3">{item.quantity || 'N/A'}</td>
                    <td className="p-3">{item.price ? Number(item.price).toLocaleString('vi-VN') : 'N/A'}</td>
                    <td className="p-3">{item.subtotal ? Number(item.subtotal).toLocaleString('vi-VN') : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Đóng
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ReportAnalytics;