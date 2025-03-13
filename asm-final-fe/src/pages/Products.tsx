// src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaSearch } from 'react-icons/fa';
import { getProducts } from '../services/productService';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho tìm kiếm và bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]); // Khoảng giá mặc định
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBrandsOpen, setIsBrandsOpen] = useState(true); // State cho collapsible brands
  const itemsPerPage = 6; // Số sản phẩm mỗi trang

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Lấy danh sách thương hiệu (giả định từ dữ liệu API)
  const brands = [...new Set(products.map((product) => product.category.name))];

  // Xử lý tìm kiếm và bộ lọc
  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) => selectedBrands.includes(product.category.name));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchQuery, priceRange, selectedBrands, products]);

  // Tính toán phân trang
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý thay đổi thương hiệu
  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Xử lý loading và error
  if (loading) return <div className="text-center py-12 text-gray-600">Đang tải sản phẩm...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Tất cả sản phẩm</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Bộ lọc */}
          <motion.div
            className="lg:w-1/4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 sticky top-4"
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            >
              {/* Bộ lọc giá */}
              <motion.div
                className="mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Lọc theo giá</h3>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <motion.span
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {priceRange[0].toLocaleString('vi-VN')} đ
                  </motion.span>
                  <motion.span
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {priceRange[1].toLocaleString('vi-VN')} đ
                  </motion.span>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  transition={{ duration: 0.3 }}
                >
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full accent-indigo-600"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-indigo-600 mt-2"
                  />
                </motion.div>
              </motion.div>

              {/* Bộ lọc danh mục */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3
                  className="text-lg font-semibold text-gray-800 mb-2 flex items-center cursor-pointer"
                  onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                >
                  Lọc theo danh mục
                  <motion.span
                    animate={{ rotate: isBrandsOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-2"
                  >
                    ▼
                  </motion.span>
                </h3>
                <AnimatePresence>
                  {isBrandsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {brands.map((brand) => (
                        <motion.div
                          key={brand}
                          className="flex items-center"
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        >
                          <input
                            type="checkbox"
                            id={brand}
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandChange(brand)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200"
                          />
                          <label
                            htmlFor={brand}
                            className="ml-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                          >
                            {brand}
                          </label>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Danh sách sản phẩm và ô tìm kiếm */}
          <div className="lg:w-3/4">
            {/* Ô tìm kiếm */}
            <motion.div
              className="mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="relative max-w-xl mx-auto"
                whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-12 bg-gradient-to-r from-white to-gray-50 shadow-sm transition-all duration-300"
                />
                <motion.div
                  className="absolute left-4 top-[18px] transform -translate-y-1/2 text-gray-500 flex"
                  animate={{ scale: searchQuery ? 1.2 : 1, transition: { duration: 0.3 } }}
                >
                  <FaSearch />
                </motion.div>
              </motion.div>
            </motion.div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                Không tìm thấy sản phẩm nào phù hợp.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={
                            product.imageUrl || 'https://via.placeholder.com/600x600?text=No+Image'
                          }
                          alt={product.name}
                          className="w-full h-64 object-cover"
                          loading="lazy"
                        />
                        <div className="p-4">
                          <h3 className="text-lg font-medium line-clamp-2 text-gray-800">
                            {product.name}
                          </h3>
                          <div className="flex items-center mt-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={
                                  i < 4.5 ? 'text-yellow-400' : 'text-gray-300'
                                }
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              (4.5 - {product.stock || 0} đánh giá)
                            </span>
                          </div>
                          <p className="mt-2 text-gray-900 font-semibold">
                            {product.price.toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 space-x-2">
                    {[...Array(totalPages)].map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === index + 1
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } transition-all duration-300`}
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {index + 1}
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}