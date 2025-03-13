// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useTransform, useViewportScroll } from 'framer-motion';
import { ArrowRight, ShoppingCart, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Star } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getProducts, getCategories } from '../services/productService';
import { addToCart } from '../services/cartService';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function Home() {
  const { scrollY } = useViewportScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { user } = useStore();
  const navigate = useNavigate();

  // Lấy danh sách sản phẩm và loại sản phẩm
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getProducts();
        const categoriesData = await getCategories();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      }
    };
    fetchData();
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
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    try {
      const cartItem = {
        productId: productId,
        quantity: 1,
      };
      await addToCart(cartItem);
      toast.success('Thêm vào giỏ hàng thành công!');
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error.message);
      toast.error(`Lỗi khi thêm vào giỏ hàng: ${error.response?.data?.message || 'Vui lòng thử lại!'}`);
    }
  };

  // Giới hạn số lượng sản phẩm mới nhất (chỉ lấy 6 sản phẩm đầu tiên)
  const latestProducts = products.slice(0, 6);

  // Lọc sản phẩm theo loại
  const getProductsByCategory = (categoryId) => {
    return products
      .filter((product) => product.category?.id === categoryId)
      .slice(0, 4);
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
            alt="Hero Background - Fashion Banner"
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </motion.div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between">
            <div className="text-left space-y-6 z-10 max-w-md">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-wide"
                style={{ textShadow: '2px 2px 6px rgba(0, 0, 0, 0.4)' }}
              >
                QUẦN DÀI
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-lg sm:text-xl text-white flex items-center"
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

      {/* Explore Style Section (Khám phá phong cách) - Bố cục chồng lấp */}
      <section className="relative py-24 bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-gray-200" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Nội dung bên trái */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 z-10"
            >
              <h2 className="text-5xl font-extrabold text-gray-800">KHÁM PHÁ PHONG CÁCH</h2>
              <p className="text-lg text-gray-600">
                Tạo nên phong cách riêng với những bộ sưu tập quần áo mới nhất, từ năng động đến lịch lãm.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300"
              >
                Xem ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
            {/* Hình ảnh chồng lấp với hiệu ứng 3D */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, rotateY: 90, translateZ: -100 }}
                whileInView={{ opacity: 1, rotateY: 0, translateZ: 0 }}
                transition={{ duration: 1 }}
                whileHover={{ scale: 1.05, rotateY: 15, translateZ: 20 }}
                className="absolute -left-10 w-80 h-96 rounded-xl shadow-2xl"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img
                  src="https://vulcano.sgp1.digitaloceanspaces.com/media/6668/1035.jpg"
                  alt="Explore Style 1 - Activewear"
                  className="w-full h-full object-cover rounded-xl"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, rotateY: -90, translateZ: -100 }}
                whileInView={{ opacity: 1, rotateY: 0, translateZ: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                whileHover={{ scale: 1.05, rotateY: -15, translateZ: 20 }}
                className="absolute left-40 top-10 w-80 h-96 rounded-xl shadow-2xl"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img
                  src="https://vulcano.sgp1.digitaloceanspaces.com/media/7113/0617.jpg"
                  alt="Explore Style 2 - Casual Shirt"
                  className="w-full h-full object-cover rounded-xl"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section (Sản phẩm mới nhất - Giới hạn 6 sản phẩm) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">SẢN PHẨM MỚI NHẤT</h2>
          <Slider {...sliderSettings}>
            {latestProducts.map((product, index) => (
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

      {/* Our Mission Section (Sứ mệnh) - Bố cục bất đối xứng */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            {/* Hình ảnh bên trái với hiệu ứng 3D */}
            <motion.div
              initial={{ opacity: 0, rotateX: 90, translateZ: -100 }}
              whileInView={{ opacity: 1, rotateX: 0, translateZ: 0 }}
              transition={{ duration: 1 }}
              whileHover={{ scale: 1.05, rotateX: 10, translateZ: 20 }}
              className="md:col-span-1 relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img
                src="https://lamia.com.vn/storage/vest/set-vest-nu-dang-suong-phoi-quan-baggy-cap-xep-ly-le220.jpg"
                alt="Our Mission - Sustainable Fashion"
                className="w-full h-100 object-cover rounded-lg shadow-2xl"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-indigo-500/30 to-transparent rounded-lg"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
            {/* Nội dung bên phải */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-2 space-y-6"
            >
              <h2 className="text-4xl font-bold text-gray-900">SỨ MỆNH CỦA CHÚNG TÔI</h2>
              <p className="text-lg text-gray-600">
                Chúng tôi cam kết mang đến những sản phẩm quần áo thời trang bền vững, chất lượng cao và phù hợp với mọi phong cách sống.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300"
              >
                Tìm hiểu thêm
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
          {/* Đường viền trang trí động */}
          <motion.div
            className="absolute top-0 left-0 w-24 h-24 border-4 border-indigo-500 rounded-full"
            initial={{ scale: 0, rotate: 0 }}
            whileInView={{ scale: 1, rotate: 360 }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          />
        </div>
      </section>

      {/* Special Offers Section (Ưu đãi đặc biệt) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">ƯU ĐÃI ĐẶC BIỆT</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Quần Jeans Giảm 30%',
                image: 'https://product.hstatic.net/1000210295/product/project_a_thinh8194_copy_723cdcdb343c430597d8031b9ce9678e_1024x1024.jpg',
                description: 'Quần jeans cao cấp, giảm giá đặc biệt chỉ trong tuần này.',
                originalPrice: '1,200,000 đ',
                discountPrice: '840,000 đ',
              },
              {
                title: 'Áo Thun Miễn Phí Ship',
                image: 'https://product.hstatic.net/200000325151/product/8bpu7-mau-ao-thun-nam-dep-3_078d678fa34c410381d00e3dfcb06562.png',
                description: 'Áo thun chất lượng cao, miễn phí vận chuyển toàn quốc.',
                originalPrice: '350,000 đ',
                discountPrice: '350,000 đ',
              },
              {
                title: 'Quần Kaki Giảm 20%',
                image: 'https://trungnien.vn/wp-content/uploads/2024/08/TS372X.jpg',
                description: 'Quần kaki phong cách, giảm giá hấp dẫn cho bạn.',
                originalPrice: '800,000 đ',
                discountPrice: '640,000 đ',
              },
            ].map((offer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateY: -90 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, rotateY: 15, translateZ: 30 }}
                className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-[600px]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-2/3 object-cover"
                />
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">{offer.description}</p>
                  <p className="text-lg text-gray-500 line-through mb-1">{offer.originalPrice}</p>
                  <p className="text-xl font-bold text-indigo-600 mb-4">{offer.discountPrice}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products by Category Section */}
      {categories.map((category) => {
        const categoryProducts = getProductsByCategory(category.id);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900">{category.name.toUpperCase()}</h2>
                <Link
                  to={`/category/${category.id}`}
                  className="text-indigo-600 font-semibold hover:underline flex items-center"
                >
                  Xem tất cả
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative group"
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
              </div>
            </div>
          </section>
        );
      })}

      {/* Why Choose Us Section with 3D Effect */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">TẠI SAO CHỌN CHÚNG TÔI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Chất lượng cao',
                description: 'Sản phẩm quần áo được làm từ chất liệu cao cấp, bền đẹp theo thời gian.',
                icon: 'https://img.icons8.com/?size=100&id=22136&format=png&color=000000',
              },
              {
                title: 'Giao hàng nhanh',
                description: 'Giao quần áo toàn quốc trong 24-48h với dịch vụ đáng tin cậy.',
                icon: 'https://img.icons8.com/ios-filled/50/000000/truck.png',
              },
              {
                title: 'Hỗ trợ 24/7',
                description: 'Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc về quần áo của bạn.',
                icon: 'https://img.icons8.com/ios-filled/50/000000/headset.png',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, rotateX: 10, rotateY: 10 }}
                className="bg-white rounded-lg shadow-xl p-6 text-center"
              >
                <img src={item.icon} alt={item.title} className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Section */}
      <section className="relative py-24 bg-gray-200 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://media3.coolmate.me/cdn-cgi/image/quality=80,format=auto/uploads/March2025/running-desk-nam.jpg"
            alt="Promotional - Running Gear"
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

      {/* Customer Reviews Section (Đánh giá khách hàng) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">ĐÁNH GIÁ TỪ KHÁCH HÀNG</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Nguyễn Văn An',
                review: 'Chất lượng quần áo rất tốt, mặc thoải mái và phong cách. Sẽ tiếp tục ủng hộ shop!',
                rating: 5,
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              },
              {
                name: 'Trần Thị Bình',
                review: 'Giao hàng nhanh, áo thun đẹp và đúng size. Rất hài lòng với dịch vụ của shop.',
                rating: 4,
                avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
              },
              {
                name: 'Lê Hoàng Nam',
                review: 'Quần jeans rất bền, giá cả hợp lý. Shop tư vấn nhiệt tình, đáng để mua.',
                rating: 5,
                avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
              },
            ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-gray-50 rounded-lg shadow-lg p-6 text-center"
              >
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800">{review.name}</h3>
                <div className="flex justify-center my-2">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">{review.review}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fashion Tips Section (Mẹo phối đồ) */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">MẸO PHỐI ĐỒ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Phối đồ công sở lịch lãm',
                image: 'https://pos.nvncdn.com/650b61-144700/art/artCT/20240423_VGKGHQ4f.png',
                description: 'Kết hợp áo sơ mi trắng với quần kaki và một chiếc áo blazer để tạo phong cách chuyên nghiệp.',
                link: '/blog/office-style',
              },
              {
                title: 'Phong cách năng động với đồ thể thao',
                image: 'https://5sfashion.vn/storage/upload/images/ckeditor/t9fCf8hGLzf2tRNorkNHGwy6hUcNJdt2H8DEYDWJ.jpg',
                description: 'Chọn quần jogger phối cùng áo thun và giày sneaker để thoải mái vận động cả ngày.',
                link: '/blog/activewear-style',
              },
              {
                title: 'Dạo phố trẻ trung với jeans',
                image: 'https://lh7-us.googleusercontent.com/sWY928fEQm7cMZ19xYJ5ftICkc3LEAEfd1ZY1z9aodFJbalNrb6qYqOxGBpbQVsMW5RDHncGIeyH3EVsliHtQFnB2o-67JpVNYdMnhr8V6qh3e-KkdXbzgxTlF4MEXdkN4l3u21COMGhNQk2tMJ6xIs',
                description: 'Phối quần jeans với áo phông đơn giản và một đôi giày thể thao để tạo phong cách năng động.',
                link: '/blog/jeans-style',
              },
            ].map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-xl overflow-hidden"
              >
                <img
                  src={tip.image}
                  alt={tip.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{tip.title}</h3>
                  <p className="text-gray-600 mb-4">{tip.description}</p>
                  <Link
                    to={tip.link}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300"
                  >
                    Xem thêm
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed Section (Hình ảnh từ Instagram) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">THEO DÕI CHÚNG TÔI TRÊN INSTAGRAM</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://lh7-us.googleusercontent.com/jyslG7vjtjt0FeoawwTXMF3baqjxhtMRUj-uQUF6edLAwnBO15D1zjN9twG80jrEbUoEeG8jsDHUyfDXtDKyN-zXieAlif0UwJ0_R6QLybbsTWSr0hWcAzGN0m6oRanATJzbEzt4xHdNIFfRu0S6Wls',
              'https://storage.googleapis.com/ops-shopee-files-live/live/shopee-blog/2023/05/b3411e2e-1.jpg',
              'https://tieudung.kinhtedothi.vn/upload_images/images/2016/05/21/Thanh-Hang-huong-dan-cac-hoc-tro-tao-dang-tu-nhien-truoc-ong-kinh.jpg',
              'https://tieudung.kinhtedothi.vn/upload_images/images/2016/05/21/6J0A3962.jpg',
            ].map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img
                  src={image}
                  alt={`Instagram Post ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Instagram className="h-8 w-8 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300"
            >
              Theo dõi ngay
              <Instagram className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer Section */}
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
              <div className="flex space-x-4">
                <motion.a
                  href="https://facebook.com"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-gray-400 hover:text-white"
                >
                  <Facebook className="h-6 w-6" />
                </motion.a>
                <motion.a
                  href="https://instagram.com"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-gray-400 hover:text-white"
                >
                  <Instagram className="h-6 w-6" />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-gray-400 hover:text-white"
                >
                  <Twitter className="h-6 w-6" />
                </motion.a>
              </div>
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