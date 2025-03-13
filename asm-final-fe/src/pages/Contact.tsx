// src/pages/Contact.js
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <div className="min-h-screen font-sans bg-gray-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center bg-gradient-to-r from-gray-100 to-indigo-200/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-wide"
            style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)' }}
          >
            LIÊN HỆ VỚI CHÚNG TÔI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="mt-4 text-xl text-gray-600 max-w-xl mx-auto"
          >
            Chúng tôi luôn sẵn sàng hỗ trợ bạn với mọi thắc mắc về sản phẩm và dịch vụ.
          </motion.p>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-gray-900 text-center mb-12"
          >
            THÔNG TIN LIÊN HỆ
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
            >
              <MapPin className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Địa chỉ</h3>
              <p className="text-gray-600">123 Đường Thời Trang, Quận 1, TP. HCM</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
            >
              <Phone className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Điện thoại</h3>
              <p className="text-gray-600">+84 123 456 789</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
            >
              <Mail className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">support@thoitrang.vn</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-gray-900 text-center mb-12"
          >
            GỬI TIN NHẮN CHO CHÚNG TÔI
          </motion.h2>
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg mx-auto bg-white rounded-lg p-8 shadow-lg"
          >
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập email"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                Tin nhắn
              </label>
              <textarea
                id="message"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                placeholder="Nhập nội dung tin nhắn"
                required
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, backgroundColor: '#4c51bf' }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300"
            >
              GỬI TIN NHẮN
              <ArrowRight className="ml-2 h-5 w-5 inline" />
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-gray-900 text-center mb-12"
          >
            VỊ TRÍ CỦA CHÚNG TÔI
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-96 rounded-lg overflow-hidden shadow-lg"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.858801183323!2d106.7000!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529292e23d8bf%3A0x2ef62f5da9d5dd55!2sDistrict%201%2C%20Ho%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635838495083!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </div>
      </section>

      {/* Footer (Đồng bộ với Home và About) */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Us */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold">Về chúng tôi</h3>
              <p className="text-gray-400">
                Chúng tôi là shop quần áo hàng đầu, mang đến những sản phẩm thời trang chất lượng cao và phong cách.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-gray-400 hover:text-white hover:underline">
                    Sản phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white hover:underline">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white hover:underline">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link to="/sports" className="text-gray-400 hover:text-white hover:underline">
                    Đồ thể thao
                  </Link>
                </li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>123 Đường Thời Trang, TP. HCM</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>+84 123 456 789</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>support@thoitrang.vn</span>
                </li>
              </ul>
            </motion.div>

            {/* Newsletter Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold">Đăng ký nhận tin</h3>
              <p className="text-gray-400">Nhận ưu đãi và thông tin mới nhất về quần áo từ chúng tôi.</p>
              <form className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="px-4 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300"
                >
                  Đăng Ký
                </button>
              </form>
            </motion.div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-6 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Shop Quần Áo Việt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}