import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'quickbite_cart_v1';

export function CartProvider({ children }) {
  const { showToast } = useToast();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product.is_available) {
      showToast('This dish is currently unavailable.', 'error');
      return;
    }
    const addQty = Math.max(1, parseInt(quantity, 10) || 1);

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(50, item.quantity + addQty) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price_inr: Number(product.price_inr),
          image_url: product.image_url,
          is_veg: Boolean(product.is_veg),
          category_name: product.categories?.name || '',
          quantity: Math.min(50, addQty),
        },
      ];
    });

    showToast(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId, nextQuantity) => {
    const qty = parseInt(nextQuantity, 10);
    if (!Number.isFinite(qty) || qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: Math.min(50, qty) } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totals = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal =
      Math.round(items.reduce((sum, item) => sum + item.price_inr * item.quantity, 0) * 100) /
      100;
    const deliveryFee = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const grandTotal = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
    const amountForFreeDelivery = subtotal > 0 && subtotal < 499 ? Math.ceil(499 - subtotal) : 0;

    return {
      itemCount,
      subtotal,
      deliveryFee,
      tax,
      grandTotal,
      amountForFreeDelivery,
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        ...totals,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
