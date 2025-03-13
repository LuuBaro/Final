// src/pages/About.js
import React from 'react';
import { motion, useTransform, useViewportScroll } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const { scrollY } = useViewportScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const rotateY = useTransform(scrollY, [0, 500], [0, 20]);
  const translateZ = useTransform(scrollY, [0, 500], [0, 100]);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-gray-50">
      {/* Hero Section with 3D Effect */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <motion.div
          style={{ opacity, rotateY, translateZ }}
          className="absolute inset-0"
          initial={{ opacity: 0, rotateY: -30, translateZ: -200 }}
          animate={{ opacity: 1, rotateY: 0, translateZ: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
              filter: 'blur(5px)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-indigo-500/40" />
        </motion.div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 100, rotateX: 90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.5, duration: 1.2 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-wide"
            style={{ textShadow: '3px 3px 10px rgba(0, 0, 0, 0.7)' }}
          >
            VỀ CHÚNG TÔI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="mt-6 text-xl sm:text-2xl text-gray-200 max-w-2xl mx-auto"
          >
            Khám phá câu chuyện và đam mê phía sau thương hiệu thời trang hàng đầu của chúng tôi.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-8"
          >
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-110"
            >
              KHÁM PHÁ SẢN PHẨM
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section with 3D Card Flip */}
      <section className="py-24 bg-gradient-to-r from-gray-100 to-indigo-100/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 50, rotateY: -45 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1.2 }}
            className="text-5xl font-bold text-gray-900 text-center mb-16"
            style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)' }}
          >
            CÂU CHUYỆN CỦA CHÚNG TÔI
          </motion.h2>
          <motion.div
            initial={{ rotateY: -90, translateZ: -200 }}
            whileInView={{ rotateY: 0, translateZ: 0 }}
            transition={{ duration: 1.5 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotateY: 15, translateZ: 50 }}
              className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
                alt="Our Story"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
            <div className="space-y-6 text-gray-700">
              <p className="text-lg leading-relaxed">
                Thành lập vào năm 2015, chúng tôi bắt đầu với đam mê mang đến những bộ trang phục thời trang, chất lượng cao cho mọi khách hàng. Từ một cửa hàng nhỏ, chúng tôi đã phát triển thành thương hiệu được yêu thích với hàng nghìn sản phẩm độc đáo.
              </p>
              <p className="text-lg leading-relaxed">
                Mỗi sản phẩm là kết quả của sự sáng tạo và cam kết bền vững, giúp bạn tỏa sáng trong mọi dịp.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Mission & Vision Section with 3D Blocks */}
      <section className="py-24 bg-gray-100 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-gray-900 text-center mb-16" style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)' }}>
            SỨ MỆNH & TẦM NHÌN
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ rotateX: 90, translateZ: -100 }}
              whileInView={{ rotateX: 0, translateZ: 0 }}
              transition={{ duration: 1.2 }}
              whileHover={{ scale: 1.05, rotateX: 10, translateZ: 30 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="bg-white rounded-xl p-8 shadow-xl border border-gray-200"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Sứ Mệnh</h3>
              <p className="text-gray-600 leading-relaxed">
                Mang đến những bộ quần áo thời trang bền vững, chất lượng cao, phù hợp với mọi phong cách sống, đồng thời bảo vệ môi trường.
              </p>
            </motion.div>
            <motion.div
              initial={{ rotateX: -90, translateZ: -100 }}
              whileInView={{ rotateX: 0, translateZ: 0 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              whileHover={{ scale: 1.05, rotateX: -10, translateZ: 30 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="bg-white rounded-xl p-8 shadow-xl border border-gray-200"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Tầm Nhìn</h3>
              <p className="text-gray-600 leading-relaxed">
                Trở thành thương hiệu thời trang hàng đầu Việt Nam, lan tỏa phong cách sống hiện đại và thân thiện với thiên nhiên.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Team Section with 3D Flip Cards */}
      <section className="py-24 bg-gradient-to-r from-gray-200 to-indigo-100/20 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-gray-900 text-center mb-16" style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)' }}>
            ĐỘI NGŨ CỦA CHÚNG TÔI
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                name: 'Nguyễn Văn A',
                role: 'Thiết kế trưởng',
                image: 'https://randomuser.me/api/portraits/men/1.jpg',
                description: 'Chuyên gia về thiết kế thời trang hiện đại với hơn 10 năm kinh nghiệm.',
              },
              {
                name: 'Trần Thị B',
                role: 'Quản lý sản xuất',
                image: 'https://randomuser.me/api/portraits/women/2.jpg',
                description: 'Đảm bảo chất lượng từng sản phẩm với sự tỉ mỉ và tận tâm.',
              },
              {
                name: 'Lê Văn C',
                role: 'Marketing Leader',
                image: 'https://randomuser.me/api/portraits/men/3.jpg',
                description: 'Chuyên gia xây dựng thương hiệu và chiến lược tiếp thị sáng tạo.',
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ rotateY: 90, translateZ: -150 }}
                whileInView={{ rotateY: 0, translateZ: 0 }}
                transition={{ duration: 1.2, delay: index * 0.2 }}
                whileHover={{ scale: 1.1, rotateY: 15, translateZ: 50 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="bg-white rounded-xl p-6 shadow-xl border border-gray-200 text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-40 h-40 rounded-full mx-auto mb-4 object-cover"
                  loading="lazy"
                />
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-gray-600 mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section with Parallax */}
      <section className="relative py-24 bg-gradient-to-br from-gray-100 to-indigo-200/40 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1503342217505-8a896a0e6da6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
          }}
          animate={{ y: [-20, 20] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-5xl font-bold text-gray-900 mb-6"
            style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)' }}
          >
            HÃY TRỞ THÀNH PHẦN CỦA CHÚNG TÔI
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-xl text-gray-700 mb-8 max-w-xl mx-auto"
          >
            Tham gia ngay để trải nghiệm thời trang đỉnh cao và nhận ưu đãi độc quyền!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-2xl transform hover:scale-110"
            >
              MUA SẮM NGAY
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer Placeholder (Đồng bộ với Home) */}
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
                  <span>123 Đường Thời Trang, TP. HCM</span>
                </li>
                <li className="flex items-center">
                  <span>+84 123 456 789</span>
                </li>
                <li className="flex items-center">
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