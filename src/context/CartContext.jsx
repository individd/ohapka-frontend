import { createContext, useContext, useMemo, useReducer } from 'react';

const CartContext = createContext(null);

function clampQuantity(quantity, min, stock) {
  const safeMin = Math.max(1, min || 1);
  const safeStock = stock ?? safeMin;
  return Math.min(Math.max(quantity, safeMin), safeStock);
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, quantity } = action.payload;
      const existing = state.find((item) => item.id === product.id);
      const maxQty = product.stock;
      if (existing) {
        const updated = state.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: clampQuantity(item.quantity + quantity, product.min, maxQty),
              }
            : item,
        );
        return updated;
      }

      return [
        ...state,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          min: product.min,
          step: product.step,
          stock: product.stock,
          image: product.images?.[0] || '',
          quantity: clampQuantity(quantity, product.min, maxQty),
        },
      ];
    }
    case 'UPDATE': {
      const { id, quantity } = action.payload;
      return state.map((item) =>
        item.id === id
          ? { ...item, quantity: clampQuantity(quantity, item.min, item.stock) }
          : item,
      );
    }
    case 'REMOVE': {
      return state.filter((item) => item.id !== action.payload.id);
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  const api = useMemo(
    () => ({
      cart,
      addToCart: (product, quantity) =>
        dispatch({ type: 'ADD', payload: { product, quantity } }),
      updateCartQuantity: (id, quantity) =>
        dispatch({ type: 'UPDATE', payload: { id, quantity } }),
      removeFromCart: (id) => dispatch({ type: 'REMOVE', payload: { id } }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }),
    [cart],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
