import { create } from 'zustand';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { getCartItems, addToCart, removeFromCart, updateCartQuantity, checkout } from '../services/cartService';
import { useNavigate } from 'react-router-dom';
export const useStore = create((set, get) => {
  const initializeUser = () => {
    const token = Cookies.get('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return {
          id: decoded.userId || decoded.sub || null,
          name: decoded.fullName || decoded.name || 'Người dùng',
          email: decoded.email || null,
          role: decoded.roles || 'USER', // Lấy roles từ token, mặc định là 'USER' nếu không có
        };
      } catch (error) {
        console.error('Lỗi decode token:', error);
        Cookies.remove('authToken');
        return null;
      }
    }
    return null;
  };

  const initialUser = initializeUser();

  const syncCart = async () => {
    const { user } = get();
    if (user && user.id) {
      try {
        const cartItems = await getCartItems();
        set({ cart: cartItems || [] });
      } catch (error) {
        console.error('Lỗi khi đồng bộ giỏ hàng:', error.message);
        set({ cart: [] });
      }
    } else {
      set({ cart: [] });
    }
  };

  return {
    user: initialUser,
    cart: [],

    login: ({ token, role, navigate }) => { // Thêm navigate làm tham số
      if (!token) {
        console.warn('Không có token để đăng nhập');
        return;
      }
      try {
        Cookies.set('authToken', token, { expires: 7 });
        const decoded = jwtDecode(token);
        const userData = {
          id: decoded.userId || decoded.sub || null,
          name: decoded.fullName || decoded.name || 'Người dùng',
          email: decoded.email || null,
          role: role || decoded.roles || 'USER',
        };
        console.log('UserData sau khi đăng nhập:', userData);
  
        if (userData) {
          set({ user: userData });
          syncCart();
          // Điều hướng dựa trên role
          if (userData.role === 'ADMIN' && navigate) {
            navigate('/admin/dashboard');
          } else if (navigate) {
            navigate('/'); // Điều hướng USER về trang chủ
          }
        } else {
          console.error('Không thể decode token để lấy thông tin user');
          Cookies.remove('authToken');
          set({ user: null });
        }
      } catch (error) {
        console.error('Lỗi trong quá trình đăng nhập:', error);
        Cookies.remove('authToken');
        set({ user: null });
      }
    },

    logout: (navigate) => {
      Cookies.remove('authToken');
      set({ user: null, cart: [] });
      navigate('/login'); // Chuyển hướng về trang login
    },  

    syncCart,

    fetchCart: async () => {
      await syncCart();
    },

    addToCart: async (productId, quantity = 1) => {
      try {
        const { cart } = get();
        const cartItem = { productId, quantity };
        await addToCart(cartItem);
        const existingItem = cart.find(item => item.product.id === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
          set({ cart: [...cart] });
        } else {
          set(state => ({ cart: [...state.cart, { product: { id: productId }, quantity }] }));
        }
        await syncCart();
      } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error.message);
        throw error;
      }
    },

    removeFromCart: async (cartId) => {
      try {
        const { cart } = get();
        await removeFromCart(cartId);
        const updatedCart = cart.filter(item => item.id !== cartId);
        set({ cart: updatedCart });
        await syncCart();
      } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error.message);
        throw error;
      }
    },

    updateQuantity: async (cartId, quantity) => {
      try {
        const { cart } = get();
        await updateCartQuantity(cartId, quantity);
        const updatedCart = cart.map(item =>
          item.id === cartId ? { ...item, quantity } : item
        );
        set({ cart: updatedCart });
        await syncCart();
      } catch (error) {
        console.error('Lỗi khi cập nhật số lượng:', error.message);
        throw error;
      }
    },

    checkout: async () => {
      try {
        const order = await checkout();
        await syncCart();
        return order;
      } catch (error) {
        console.error('Lỗi khi thanh toán:', error.message);
        throw error;
      }
    },
  };
});