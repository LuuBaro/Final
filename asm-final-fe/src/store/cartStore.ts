import { create } from 'zustand';
import { Product } from '../data/products';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  total: number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
      set({
        items: items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },
  removeItem: (productId) => {
    set({ items: get().items.filter(item => item.id !== productId) });
  },
  updateQuantity: (productId, quantity) => {
    set({
      items: get().items.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      )
    });
  },
  total: 0,
}));