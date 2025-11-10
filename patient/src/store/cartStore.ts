import { create } from 'zustand';
import { CartItem, Medicine, Pharmacy } from '@/src/types';

interface CartState {
  items: CartItem[];
  
  // Actions
  addToCart: (medicine: Medicine, pharmacy: Pharmacy, quantity?: number) => void;
  removeFromCart: (medicineId: string, pharmacyId: string) => void;
  updateQuantity: (medicineId: string, pharmacyId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => {
  // Initialize with empty array
  const initialState = {
    items: [] as CartItem[],
  };

  return {
    ...initialState,

    addToCart: (medicine, pharmacy, quantity = 1) => {
      // Validate inputs
      if (!medicine || !medicine._id || !pharmacy || !pharmacy._id) {
        console.error('Invalid medicine or pharmacy object', { medicine, pharmacy });
        return;
      }

      const { items = [] } = get();
      const existingItemIndex = items.findIndex(
        item => item.medicine._id === medicine._id && item.pharmacy._id === pharmacy._id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += quantity;
        set({ items: updatedItems });
      } else {
        const newItem: CartItem = {
          medicine,
          pharmacy,
          quantity,
        };
        set({ items: [...items, newItem] });
      }
    },

    removeFromCart: (medicineId, pharmacyId) => {
      const { items = [] } = get();
      const filteredItems = items.filter(
        item => !(item.medicine._id === medicineId && item.pharmacy._id === pharmacyId)
      );
      set({ items: filteredItems });
    },

    updateQuantity: (medicineId, pharmacyId, quantity) => {
      const { items = [] } = get();
      if (quantity <= 0) {
        get().removeFromCart(medicineId, pharmacyId);
        return;
      }

      const updatedItems = items.map(item => {
        if (item.medicine._id === medicineId && item.pharmacy._id === pharmacyId) {
          return { ...item, quantity };
        }
        return item;
      });
      set({ items: updatedItems });
    },

    clearCart: () => set({ items: [] }),

    getTotalItems: () => {
      const { items = [] } = get();
      return items.reduce((total, item) => total + (item?.quantity || 0), 0);
    },

    getTotalPrice: () => {
      const { items = [] } = get();
      return items.reduce((total, item) => {
        const price = item?.medicine?.price || 0;
        const quantity = item?.quantity || 0;
        return total + (price * quantity);
      }, 0);
    },
  };
});