import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, Heart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Toaster } from 'react-hot-toast';
import { Loading } from './components/Loading';
import { Cart } from './components/Cart';
import { ProductCard } from './components/ProductCard';
import { products, categories } from './data/products';
import { useCartStore } from './store/cartStore';

function App() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useCartStore(state => state.items);

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [categoriesRef, categoriesInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [productsRef, productsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" />
      <AnimatePresence>
        {loading && <Loading />}
      </AnimatePresence>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Top Banner */}
      <div className="bg-black text-white py-2 text-center text-sm">
        Freeship cho đơn hàng từ 500K
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Menu 
                className="h-6 w-6 mr-4 cursor-pointer md:hidden" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
              <h1 className="text-2xl font-bold">YAME</h1>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('categories')} className="hover:text-blue-600">Danh Mục</button>
              <button onClick={() => {setActiveCategory('ao'); scrollToSection('products')}} className="hover:text-blue-600">Áo</button>
              <button onClick={() => {setActiveCategory('quan'); scrollToSection('products')}} className="hover:text-blue-600">Quần</button>
              <button onClick={() => scrollToSection('products')} className="hover:text-blue-600">Sản Phẩm</button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="fixed inset-0 bg-white z-50 md:hidden"
                >
                  <div className="p-4">
                    <button 
                      onClick={() => setIsMenuOpen(false)}
                      className="absolute top-4 right-4 text-2xl"
                    >
                      ✕
                    </button>
                    <div className="flex flex-col space-y-4 mt-12">
                      <button onClick={() => scrollToSection('categories')} className="text-lg">Danh Mục</button>
                      <button onClick={() => {setActiveCategory('ao'); scrollToSection('products')}} className="text-lg">Áo</button>
                      <button onClick={() => {setActiveCategory('quan'); scrollToSection('products')}} className="text-lg">Quần</button>
                      <button onClick={() => scrollToSection('products')} className="text-lg">Sản Phẩm</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5 cursor-pointer" />
              <Heart className="h-5 w-5 cursor-pointer" />
              <User className="h-5 w-5 cursor-pointer" />
              <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Hero"
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold mb-4"
            >
              Bộ Sưu Tập Mới
            </motion.h2>
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-100 transition"
              onClick={() => scrollToSection('products')}
            >
              Khám phá ngay
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Featured Categories */}
      <section id="categories" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            ref={categoriesRef}
            initial={{ y: 20, opacity: 0 }}
            animate={categoriesInView ? { y: 0, opacity: 1 } : {}}
            className="text-2xl font-bold mb-8 text-center"
          >
            Danh Mục Nổi Bật
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div 
                key={category.id}
                initial={{ y: 20, opacity: 0 }}
                animate={categoriesInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative group cursor-pointer"
                onClick={() => {
                  setActiveCategory(category.id);
                  scrollToSection('products');
                }}
              >
                <img 
                  src={category.image}
                  alt={category.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center">
                  <h3 className="text-white text-xl font-semibold">{category.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12">
        <div className="container mx-auto px-4">
          <motion.h2 
            ref={productsRef}
            initial={{ y: 20, opacity: 0 }}
            animate={productsInView ? { y: 0, opacity: 1 } : {}}
            className="text-2xl font-bold mb-8 text-center"
          >
            Sản Phẩm {activeCategory !== 'all' ? categories.find(c => c.id === activeCategory)?.title : 'Mới'}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Về YAME</h4>
              <ul className="space-y-2">
                <li className="cursor-pointer hover:text-gray-300">Giới thiệu</li>
                <li className="cursor-pointer hover:text-gray-300">Liên hệ</li>
                <li className="cursor-pointer hover:text-gray-300">Tuyển dụng</li>
                <li className="cursor-pointer hover:text-gray-300">Tin tức</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2">
                <li className="cursor-pointer hover:text-gray-300">Hướng dẫn mua hàng</li>
                <li className="cursor-pointer hover:text-gray-300">Chính sách đổi trả</li>
                <li className="cursor-pointer hover:text-gray-300">Chính sách bảo hành</li>
                <li className="cursor-pointer hover:text-gray-300">Khách hàng VIP</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Thanh Toán</h4>
              <p>Chấp nhận thanh toán qua:</p>
              <div className="flex space-x-2 mt-2">
                <div className="w-12 h-8 bg-white rounded"></div>
                <div className="w-12 h-8 bg-white rounded"></div>
                <div className="w-12 h-8 bg-white rounded"></div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Kết Nối</h4>
              <p>Theo dõi chúng tôi trên mạng xã hội</p>
              <div className="flex space-x-4 mt-4">
                <div className="w-8 h-8 bg-white rounded-full"></div>
                <div className="w-8 h-8 bg-white rounded-full"></div>
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>© 2024 YAME. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;