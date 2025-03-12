import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from 'react-icons/fa'; // Thư viện icon (cài đặt: npm install react-icons)

export default function Products() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const products = [
    {
      id: '1',
      name: 'Thềm mỏng vải dạ lạnh - ECC Pants',
      price: '599.000',
      image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      rating: 4.7,
      reviews: 24,
      colors: ['#333', '#666', '#999'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      id: '2',
      name: 'Áo sơ mi dài tay Essentials Cotton',
      price: '359.000',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      reviews: 63,
      colors: ['#000', '#fff', '#333', '#666'],
      sizes: ['M', 'L', 'XL'],
    },
    {
      id: '3',
      name: 'Áo thun nam Cotton 220GSM',
      price: '161.000',
      image: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      reviews: 175,
      colors: ['#f5f5f5', '#87ceeb', '#000', '#8b4513'],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    {
      id: '4',
      name: 'Áo polo nam Pique Cotton',
      price: '254.000',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      rating: 4.5,
      reviews: 244,
      colors: ['#8b4513', '#2f4f4f', '#228b22', '#fff'],
      sizes: ['M', 'L', 'XL'],
    },
    {
      id: '5',
      name: 'Quần shorts ECC Ripstop',
      price: '249.000',
      image: 'https://images.unsplash.com/photo-1503342217505-8e375781ab6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      rating: 4.8,
      reviews: 24,
      colors: ['#d3d3d3', '#696969', '#000'],
      sizes: ['S', 'M', 'L'],
    },
  ];

  const itemsPerPage = 4; // Số sản phẩm hiển thị cùng lúc
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleProducts = products.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <div className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Tất cả sản phẩm</h1>
        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrev}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
            >
              &larr;
            </button>
            <div className="flex overflow-x-auto space-x-4 scrollbar-hide py-4">
              {visibleProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-medium line-clamp-2">{product.name}</h3>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          ({product.rating} - {product.reviews} đánh giá)
                        </span>
                      </div>
                      <p className="mt-2 text-gray-900 font-semibold">{product.price} đ</p>
                      <div className="mt-2 flex space-x-2">
                        {product.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                      <div className="mt-2 flex space-x-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            className="px-2 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <button
              onClick={handleNext}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}