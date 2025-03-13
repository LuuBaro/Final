// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  MessageCircle,
  User,
  LogOut,
  NotebookPen,
  Settings,
  Search,
} from "lucide-react";
import { useStore } from '../store/useStore';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [userName, setUserName] = useState("");
  const userMenuRef = useRef(null);
  const { user, logout } = useStore(); // Lấy user và logout từ useStore

  // Cập nhật userName khi user thay đổi
  useEffect(() => {
    if (user) {
      setUserName(user.name || "Người dùng");
    } else {
      setUserName("");
    }
  }, [user]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ useStore
    setUserName(""); // Reset userName sau khi đăng xuất
    setShowUserMenu(false); // Đóng menu người dùng
  };

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-between items-center bg-white p-4 w-full mb-6 shadow-sm"
    >
      {/* Thanh tìm kiếm */}
      <div className="relative w-1/3">
        <input
          type="text"
          placeholder="Nhập để tìm kiếm..."
          className="w-full p-2 pl-10 outline-none bg-gray-100 rounded-lg text-gray-600 focus:ring-2 focus:ring-indigo-500 transition"
        />
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
      </div>

      {/* Cài đặt & thông báo */}
      <div className="flex items-center space-x-4">
        {/* Thông báo */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-3 z-10"
            >
              <p className="text-gray-700 text-sm">Bạn có 3 thông báo mới</p>
            </motion.div>
          )}
        </div>

        {/* Tin nhắn */}
        <div className="relative">
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors relative"
          >
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {showMessages && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-3 z-10"
            >
              <p className="text-gray-700 text-sm">Bạn có 5 tin nhắn mới</p>
            </motion.div>
          )}
        </div>

        {/* Avatar & Thông tin người dùng */}
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <img
                src="https://5.imimg.com/data5/SELLER/Default/2023/3/294997220/ZX/OC/BE/3365461/acrylic-admin-office-door-sign-board.jpg"
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-700">{userName}</p>
                <p className="text-gray-400 text-xs">
                  Quản trị viên
                </p>
              </div>
            </button>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10"
              >
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
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-2 hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5 text-red-500 mr-2" />
                  Đăng xuất
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">Chưa đăng nhập</p>
        )}
      </div>
    </motion.div>
  );
};

export default Header;