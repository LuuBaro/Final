import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <h1 className="text-9xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">
          Trang bạn đang tìm kiếm không tồn tại
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Về trang chủ
        </Link>
      </motion.div>
    </div>
  );
}