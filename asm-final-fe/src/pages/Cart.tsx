import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, syncCart, user } = useStore(); // Thay fetchCart bằng syncCart

  // Đồng bộ giỏ hàng khi component mount
  useEffect(() => {
    if (user && user.id) {
      syncCart();
    }
  }, [syncCart, user]);

  // Tính tổng tiền
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Xử lý tăng số lượng
  const handleIncreaseQuantity = async (cartId, currentQuantity) => {
    try {
      await updateQuantity(cartId, currentQuantity + 1);
    } catch (error) {
      console.error('Lỗi khi tăng số lượng:', error.message);
    }
  };

  // Xử lý giảm số lượng
  const handleDecreaseQuantity = async (cartId, currentQuantity) => {
    if (currentQuantity <= 1) {
      // Nếu số lượng là 1, giảm sẽ xóa sản phẩm
      try {
        await removeFromCart(cartId);
      } catch (error) {
        console.error('Lỗi khi giảm số lượng:', error.message);
      }
    } else {
      try {
        await updateQuantity(cartId, currentQuantity - 1);
      } catch (error) {
        console.error('Lỗi khi giảm số lượng:', error.message);
      }
    }
  };

  // Xử lý xóa sản phẩm
  const handleRemoveFromCart = async (cartId) => {
    try {
      await removeFromCart(cartId);
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error.message);
    }
  };

  if (!user) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
          <p className="text-gray-600 mb-8">Vui lòng đăng nhập để xem giỏ hàng của bạn</p>
          <Link
            to="/login"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
          <p className="text-gray-600 mb-8">Giỏ hàng của bạn đang trống</p>
          <Link
            to="/products"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.id} // Sử dụng cartId từ BE
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-6 p-4 bg-white rounded-lg shadow"
              >
                <img
                  src={item.product.imageUrl || '/placeholder.jpg'}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{item.product.name}</h3>
                  <p className="text-gray-600">
                    {item.selectedSize || 'M'} - {item.selectedColor || 'Đen'}
                  </p>
                  <p className="text-indigo-600 font-medium">
                    {item.product.price.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Nút tăng/giảm số lượng */}
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-1">{item.quantity}</span>
                    <button
                      onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Nút xóa sản phẩm */}
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Tổng giỏ hàng</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{total.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                <div className="border-t pt-2 font-medium">
                  <div className="flex justify-between">
                    <span>Tổng cộng</span>
                    <span>{total.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full bg-indigo-600 text-white text-center py-3 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Thanh toán
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}