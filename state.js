const state = {
  cart: [],
};

export function addToCart(product, quantity) {
  const existing = state.cart.find(i => i.id === product.id);
  const maxQty = product.stock;

  if (existing) {
    const newQty = existing.quantity + quantity;
    existing.quantity = Math.min(newQty, maxQty);
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,  
      min: product.min,
      quantity: Math.min(quantity, maxQty),
      image: product.images[0],
      stock: product.stock
    });
  }
}

export function updateCartQuantity(id, newQty) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;

  const maxQty = item.stock;
  item.quantity = Math.max(item.min, Math.min(newQty, maxQty));
}

export function getCart() {
  return state.cart;
}

export function clearCart() {
  state.cart = [];
}

export function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
}