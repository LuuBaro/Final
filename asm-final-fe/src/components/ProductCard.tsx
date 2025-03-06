import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../data/products';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleAddToCart = () => {
    addItem(product);
    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <motion.div
      className="group relative bg-white rounded-lg shadow-lg overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full
                     opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-800 flex items-center space-x-2"
          onClick={handleAddToCart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Thêm vào giỏ</span>
        </motion.button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-800 mb-1 truncate">{product.name}</h3>
        <p className="text-red-600 font-semibold">{formatPrice(product.price)}</p>
      </div>
    </motion.div>
  );
};