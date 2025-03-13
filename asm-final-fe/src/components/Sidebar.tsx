import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layout,
  ShoppingBag,
  BarChart,
  Truck,
  Users,
  Settings,
} from 'lucide-react';

const Sidebar = ({ onToggle }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', name: 'Bảng điều khiển', icon: <Layout className="w-5 h-5" /> },
    { path: '/admin/products', name: 'Quản lý sản phẩm', icon: <ShoppingBag className="w-5 h-5" /> },
    { path: '/admin/categories', name: 'Loại sản phẩm', icon: <ShoppingBag className="w-5 h-5" /> },
    { path: '/admin/reports', name: 'Báo cáo thống kê', icon: <BarChart className="w-5 h-5" /> },
    { path: '/admin/orders', name: 'Quản lý đơn hàng', icon: <Truck className="w-5 h-5" /> },
    { path: '/admin/users', name: 'Người dùng', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/settings', name: 'Cài đặt', icon: <Settings className="w-5 h-5" /> },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) {
      onToggle(!isCollapsed);
    }
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-b from-blue-50 to-white text-gray-800 p-4 space-y-6 h-screen fixed flex flex-col shadow-lg ${
        isCollapsed ? 'items-center' : ''
      }`}
    >
      {/* Logo */}
      <motion.div
        className="text-2xl font-extrabold text-center mb-6"
      >
        <motion.span
          animate={{
            fontSize: isCollapsed ? '1.5rem' : '2rem',
            width: isCollapsed ? 'auto' : '100%',
          }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
        >
          {isCollapsed ? 'BF' : 'Baro Fashion'}
        </motion.span>
      </motion.div>

      {/* Menu */}
      <ul className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <li key={item.path} className="relative group">
            <Link
              to={item.path}
              className={`flex items-center p-3 rounded-lg transition-all duration-300 relative ${
                location.pathname === item.path
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-500'
              } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
            >
              {/* Viền trái khi active */}
              {location.pathname === item.path && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-teal-400"
                  layoutId="activeBorder"
                />
              )}
              <span>{item.icon}</span>
              <motion.span
                animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                transition={{ duration: 0.2 }}
                className={isCollapsed ? 'hidden' : 'block'}
              >
                {item.name}
              </motion.span>
            </Link>
            {/* Tooltip khi sidebar thu nhỏ */}
            {isCollapsed && (
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-10">
                {item.name}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Nút toggle ở dưới cùng */}
      <motion.div
        className="self-center mt-auto"
      >
        <motion.button
          onClick={toggleSidebar}
          className="relative bg-gradient-to-r from-blue-500 to-teal-400 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{
              width: isCollapsed ? 6 : 24,
              height: isCollapsed ? 24 : 6,
              borderRadius: isCollapsed ? '50%' : '2px',
              background: 'white',
            }}
            transition={{ duration: 0.3 }}
            className="absolute"
          />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;