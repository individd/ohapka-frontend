import React from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        background: "white",
      }}
    >
      <img
        src={product.images?.[0]}
        alt=""
        style={{
          width: "100%",
          borderRadius: 12,
          marginBottom: 8,
        }}
      />

      <h3 style={{ margin: "8px 0" }}>{product.name}</h3>

      <p style={{ color: "#777", margin: "4px 0" }}>{product.price} ₽</p>

      <button
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "#2a7bf6",
          color: "white",
          borderRadius: 10,
          border: "none",
          marginTop: 10,
          fontSize: 16,
        }}
        onClick={() => addItem(product, product.min || 1)}
      >
        Добавить
      </button>
    </div>
  );
}