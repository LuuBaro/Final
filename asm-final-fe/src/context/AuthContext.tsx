// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { getCartItems, addToCart, removeFromCart, updateCartQuantity, checkout } from '../services/cartService';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string | null;
  name: string;
  email: string | null;
  role: string;
}

interface CartItem {
  id: string; // ID của item trong giỏ hàng từ server
  product: {
    id: string;
  };
  quantity: number;
}

interface AuthContextType {
  user: User | null;
  cart: CartItem[];
  login: (token: string, role?: string, navigate?: (path: string) => void) => void;
  logout: (navigate?: (path: string) => void) => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateQuantity: (cartId: string, quantity: number) => Promise<void>;
  checkout: () => Promise<any>;
  syncCart: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  const initializeUser = () => {
    const token = Cookies.get('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return {
          id: decoded.userId || decoded.sub || null,
          name: decoded.fullName || decoded.name || 'Người dùng',
          email: decoded.email || null,
          role: decoded.roles || 'USER',
        };
      } catch (error) {
        console.error('Lỗi decode token:', error);
        Cookies.remove('authToken');
        return null;
      }
    }
    return null;
  };

  const syncCart = async () => {
    const currentUser = user;
    if (currentUser && currentUser.id) {
      try {
        const cartItems = await getCartItems();
        // Chuẩn hóa dữ liệu từ API
        const normalizedCart = Array.isArray(cartItems)
          ? cartItems.map((item: any) => ({
              id: item.id || `temp-${Date.now()}-${Math.random()}`, // Tạo ID tạm nếu thiếu
              product: { id: item.productId || item.product?.id || '' },
              quantity: item.quantity || 1,
            }))
          : [];
        setCart(normalizedCart);
      } catch (error) {
        console.error('Lỗi khi đồng bộ giỏ hàng:', error.message);
        setCart([]);
      }
    } else {
      setCart([]);
    }
  };

  useEffect(() => {
    const initialUser = initializeUser();
    setUser(initialUser);
    if (initialUser && initialUser.id) {
      syncCart(); // Đồng bộ giỏ hàng khi khởi tạo user
    }
  }, []);

  const login = (token: string, role?: string, navigate?: (path: string) => void) => {
    if (!token) {
      console.warn('Không có token để đăng nhập');
      return;
    }
    try {
      Cookies.set('authToken', token, { expires: 7 });
      const decoded = jwtDecode(token);
      const userData: User = {
        id: decoded.userId || decoded.sub || null,
        name: decoded.fullName || decoded.name || 'Người dùng',
        email: decoded.email || null,
        role: role || decoded.roles || 'USER',
      };
      console.log('UserData sau khi đăng nhập:', userData);

      setUser(userData);
      syncCart(); // Đồng bộ giỏ hàng sau khi login

      if (userData.role === 'ADMIN' && navigate) {
        navigate('/admin/dashboard');
      } else if (navigate) {
        navigate('/');
      }
    } catch (error) {
      console.error('Lỗi trong quá trình đăng nhập:', error);
      Cookies.remove('authToken');
      setUser(null);
    }
  };

  const logout = (navigate?: (path: string) => void) => {
    Cookies.remove('authToken');
    setUser(null);
    setCart([]);
    if (navigate) navigate('/login');
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const cartItem = { productId, quantity };
      const existingItem = cart.find(item => item.product.id === productId);

      // Cập nhật state ngay lập tức để hiển thị số lượng trên UI
      if (existingItem) {
        const updatedCart = cart.map(item =>
          item.product.id === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
        setCart(updatedCart);
      } else {
        setCart(prev => [...prev, { id: `temp-${Date.now()}-${Math.random()}`, product: { id: productId }, quantity }]);
      }
      console.log('Cart after immediate update:', cart);

      // Gọi API để thêm vào giỏ hàng, nhưng không syncCart ngay lập tức
      await addToCart(cartItem);
      // Không gọi syncCart ở đây để tránh fetch liên tục
      // syncCart sẽ được gọi khi cần thiết (ví dụ: sau login hoặc logout)
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error.message);
      throw error;
    }
  };

  const removeFromCart = async (cartId: string) => {
    try {
      await removeFromCart(cartId);
      const updatedCart = cart.filter(item => item.id !== cartId);
      setCart(updatedCart);
      // Không gọi syncCart ở đây để tránh fetch liên tục
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error.message);
      throw error;
    }
  };

  const updateQuantity = async (cartId: string, quantity: number) => {
    try {
      await updateCartQuantity(cartId, quantity);
      const updatedCart = cart.map(item =>
        item.id === cartId ? { ...item, quantity } : item
      );
      setCart(updatedCart);
      // Không gọi syncCart ở đây để tránh fetch liên tục
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error.message);
      throw error;
    }
  };

  const checkout = async () => {
    try {
      const order = await checkout();
      await syncCart(); // Đồng bộ giỏ hàng sau khi thanh toán
      return order;
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, cart, login, logout, addToCart, removeFromCart, updateQuantity, checkout, syncCart }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};