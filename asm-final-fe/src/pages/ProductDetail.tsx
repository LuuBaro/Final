import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = React.useState('M');
  const [selectedColor, setSelectedColor] = React.useState('Trắng');
  const { addToCart } = useStore();

  // Giả lập dữ liệu sản phẩm
  const product = {
    id,
    name: 'Áo sơ mi trắng',
    price: 599000,
    description: 'Áo sơ mi trắng basic, chất liệu cotton cao cấp, form regular fit.',
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Trắng', 'Đen', 'Xanh'],
  };

  const handleAddToCart = () => {
    addToCart({
      product,
      quantity: 1,
      selectedSize,
      selectedColor,
    });
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full rounded-lg"
            />
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold text-indigo-600">
              {product.price.toLocaleString('vi-VN')} đ
            </p>
            <p className="text-gray-600">{product.description}</p>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Kích thước</h3>
              <div className="grid grid-cols-4 gap-4">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-center rounded-md ${
                      selectedSize === size
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Màu sắc</h3>
              <div className="grid grid-cols-3 gap-4">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`py-2 text-center rounded-md ${
                      selectedColor === color
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Thêm vào giỏ hàng
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}