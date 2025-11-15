import { useMemo } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function CartPage({ onGoToOrder = () => {} }) {
  const { cart, updateCartQuantity, removeFromCart } = useCart();

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * (item.quantity / item.min), 0),
    [cart],
  );

  if (!cart.length) {
    return <div className="empty">Корзина пуста</div>;
  }

  return (
    <div className="cart">
      {cart.map((item) => {
        const itemTotal = item.price * (item.quantity / item.min);
        const maxBundles = item.stock / item.min;
        return (
          <div className="cart-item" key={item.id}>
            {item.image && <img src={item.image} className="cart-img" alt={item.name} />}

            <div className="cart-info">
              <div className="cart-name">{item.name}</div>

              <div className="qty-controls">
                <button
                  className="qty-btn cart-minus"
                  onClick={() => updateCartQuantity(item.id, Math.max(item.min, item.quantity - item.min))}
                >
                  -
                </button>
                <span className="cart-qty-value">
                  {item.quantity} шт ({item.quantity / item.min} охапки)
                </span>
                <button
                  className="qty-btn cart-plus"
                  onClick={() => {
                    const next = item.quantity + item.min;
                    if (next > item.stock) return;
                    updateCartQuantity(item.id, next);
                  }}
                >
                  +
                </button>
              </div>

              <div className="cart-price">{itemTotal} ₽</div>
              <div className="cart-stock">Осталось: {maxBundles} охапок</div>
            </div>

            <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
              ×
            </button>
          </div>
        );
      })}

      <div className="cart-summary">
        <div>Итого:</div>
        <div>{total} ₽</div>
      </div>

      <button className="cart-to-order-btn" onClick={onGoToOrder}>
        Перейти к оформлению
      </button>
    </div>
  );
}
