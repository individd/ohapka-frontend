import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { items, total, setItemQuantity, removeItem } = useCart();

  return (
    <div style={{ padding: 16 }}>
      <h2>Корзина</h2>

      {items.length === 0 && <p>Корзина пуста</p>}

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            padding: 12,
            border: "1px solid #eee",
            borderRadius: 10,
            marginTop: 12,
            background: "white",
          }}
        >
          <h4>{item.name}</h4>
          <p>{item.price} ₽</p>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setItemQuantity(item.id, item.quantity - 1)}>
              -
            </button>

            <span>{item.quantity}</span>

            <button onClick={() => setItemQuantity(item.id, item.quantity + 1)}>
              +
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            style={{ marginTop: 8, color: "red" }}
          >
            Удалить
          </button>
        </div>
      ))}

      {items.length > 0 && (
        <Link to="/checkout">
          <button
            style={{
              width: "100%",
              marginTop: 20,
              padding: 14,
              background: "#2a7bf6",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 17,
            }}
          >
            Перейти к оформлению – {total} ₽
          </button>
        </Link>
      )}
    </div>
  );
}