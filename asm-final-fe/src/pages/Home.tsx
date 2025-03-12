import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { motion, useTransform, useViewportScroll } from 'framer-motion';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getProducts } from '../services/productService';
import { addToCart } from '../services/cartService';
import { useStore } from '../store/useStore'; // Import useStore để kiểm tra user
import toast from 'react-hot-toast';
export default function Home() {
  const { scrollY } = useViewportScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const [products, setProducts] = useState([]);
  const { user } = useStore(); // Lấy thông tin user từ useStore
  const navigate = useNavigate(); // Để điều hướng

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
      }
    };
    fetchProducts();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
    ],
  };

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = async (productId) => {
    // Kiểm tra người dùng đã đăng nhập chưa
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login'); // Điều hướng đến trang đăng nhập
      return;
    }

    try {
      const cartItem = {
        productId: productId,
        quantity: 1,
      };
      const response = await addToCart(cartItem);
      toast.success('Thêm vào giỏ hàng thành công!');
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error.message);
      toast.error(`Lỗi khi thêm vào giỏ hàng: ${error.response?.data?.message || 'Vui lòng thử lại!'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-gray-100 overflow-hidden">
        <motion.div
          style={{ opacity, scale }}
          className="absolute inset-0"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <img
            src="https://menshop79.vn/wp-content/uploads/2017/03/Banner-MenShop79-001.png"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </motion.div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between">
            <div className="text-left space-y-6 z-10 max-w-md">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-800 leading-tight tracking-wide"
                style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.4)' }}
              >
                QUẦN DÀI
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-lg sm:text-xl text-gray-800 flex items-center"
              >
                <span>Tặng áo thun 220GSM trị giá 179k+</span>
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex space-x-4"
              >
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  KHÁM PHÁ NGAY
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">SẢN PHẨM MỚI NHẤT</h2>
          <Slider {...sliderSettings}>
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="px-2 relative group"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300">
                    <div className="relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-72 object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product.id);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="flex items-center px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-all duration-300">
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          <span className="font-semibold">Thêm vào giỏ</span>
                        </div>
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
                      <p className="mt-2 text-xl text-gray-900 font-bold">{product.price.toLocaleString('vi-VN')} đ</p>
                      <p className="text-sm text-gray-500">Còn lại: {product.stock}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Promotional Section */}
      <section className="relative py-24 bg-gray-200 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://media3.coolmate.me/cdn-cgi/image/quality=80,format=auto/uploads/March2025/running-desk-nam.jpg"
            alt="Running Gear"
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gray-300 bg-opacity-60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-start z-10">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-800 mb-6 tracking-wide"
            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}
          >
            ĐỒ CHẠY BỘ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl text-white mb-10 max-w-2xl text-start"
          >
            Combo ưu đãi - Mua combo tiết kiệm đến 30%
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="/sports"
              className="inline-flex items-center px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              KHÁM PHÁ NGAY
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">ĐĂNG KÝ NHẬN TIN</h2>
          <p className="text-lg text-gray-400 mb-10">Nhận thông tin về ưu đãi và bộ sưu tập mới nhất từ chúng tôi.</p>
          <form className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="px-6 py-3 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300 w-full sm:w-auto"
            >
              Đăng Ký
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}