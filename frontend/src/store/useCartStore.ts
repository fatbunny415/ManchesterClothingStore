import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
import { cartService } from '../api/services';
import { useAuthStore } from './useAuthStore';

interface CartItem extends Product {
  quantity: number;
  dbId?: string; // ID en la base de datos (CartItem.Id)
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      fetchCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try {
            const dbCart = await cartService.getMyCart();
            const mappedItems = dbCart.items.map((item: any) => ({
              ...item.product,
              quantity: item.quantity,
              dbId: item.id
            }));
            set({ items: mappedItems });
          } catch (error) {
            console.error('Error fetching cart:', error);
          }
        }
      },

      addItem: async (product) => {
        const { isAuthenticated } = useAuthStore.getState();
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === product.id);

        if (isAuthenticated) {
          try {
            await cartService.addItem(product.id);
            await get().fetchCart();
            return;
          } catch (error) {
            console.error('Error adding to cart:', error);
          }
        }

        // Fallback local
        if (existingItem) {
          set({
            items: currentItems.map(item => 
              item.id === product.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },

      removeItem: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        const item = get().items.find(i => i.id === productId);

        if (isAuthenticated && item?.dbId) {
          try {
            await cartService.removeItem(item.dbId);
            await get().fetchCart();
            return;
          } catch (error) {
            console.error('Error removing from cart:', error);
          }
        }

        set({
          items: get().items.filter(item => item.id !== productId)
        });
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        const { isAuthenticated } = useAuthStore.getState();
        const item = get().items.find(i => i.id === productId);

        if (item && quantity > item.stock) {
          return;
        }

        if (isAuthenticated && item?.dbId) {
          try {
            await cartService.updateItem(item.dbId, quantity);
            await get().fetchCart();
            return;
          } catch (error) {
            console.error('Error updating cart quantity:', error);
          }
        }

        set({
          items: get().items.map(item => 
            item.id === productId ? { ...item, quantity } : item
          )
        });
      },

      clearCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try {
            await cartService.clearCart();
          } catch (error) {
            console.error('Error clearing cart:', error);
          }
        }
        set({ items: [] });
      },

      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      
      totalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    }),
    {
      name: 'manchester-cart',
    }
  )
);
