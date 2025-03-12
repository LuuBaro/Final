import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, user, logout, syncCart } = useStore(); // Thay fetchCart bằng syncCart
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleMouseEnter = () => setIsDropdownOpen(true);
  // Đồng bộ giỏ hàng khi component mount và khi user thay đổi
  useEffect(() => {
    if (user && user.id) {
      syncCart();
    }
  }, [user, syncCart]);

  // Cập nhật userName khi user thay đổi
  useEffect(() => {
    if (user) {
      setUserName(user.name || 'Người dùng');
    } else {
      setUserName('');
    }
   
  }, [user]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Liên hệ', href: '/contact' },
  ];
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  
  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm fixed w-full z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                Fashion Store
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
             <div className="relative">
             <button
               onClick={toggleDropdown}
               onMouseEnter={handleMouseEnter}
               className="flex items-center space-x-2 user-dropdown focus-hover:opacity-100"
             >
               <User className="h-6 w-6 text-gray-600" />
               <span className="text-sm text-gray-600">{userName}</span>
             </button>
             {isDropdownOpen && (
               <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl z-10 user-dropdown">
                 <Link
                   to="/profile"
                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                 >
                   Tài khoản
                 </Link>
                 <Link
                   to="/orders"
                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                 >
                   Đơn hàng
                 </Link>
                 {user.roles === "ADMIN" && (
                   <Link
                     to="/admin"
                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                   >
                     Admin
                   </Link>
                 )}
                 <button
                   onClick={() => {
                     logout();
                     setUserName("");
                   }}
                   className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                 >
                   Đăng xuất
                 </button>
               </div>
             )}
           </div>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Đăng nhập
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-white text-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Fashion Store</h3>
              <p className="text-gray-400">
                Thời trang cao cấp cho mọi người
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <address className="text-gray-400 not-italic">
                <p>123 Đường ABC</p>
                <p>Quận 1, TP.HCM</p>
                <p>Email: contact@fashionstore.com</p>
                <p>Điện thoại: (123) 456-7890</p>
              </address>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-400">
            <p>© 2024 Fashion Store. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}