import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { sendOrder } from "../api";

export default function Checkout() {
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    delivery_date: "",
    delivery_time: "",
    comment: "",
  });

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    const order = {
      ...form,
      items,
      total,
    };

    const resp = await sendOrder(order);

    if (resp.success) {
      clearCart();
      alert("Заказ оформлен!");
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Оформление заказа</h2>

      <div style={{ marginTop: 12 }}>
        <input
          placeholder="Имя"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Телефон"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Адрес"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          style={inputStyle}
        />

        <input
          type="date"
          value={form.delivery_date}
          onChange={(e) => handleChange("delivery_date", e.target.value)}
          style={inputStyle}
        />

        <input
          type="time"
          value={form.delivery_time}
          onChange={(e) => handleChange("delivery_time", e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Комментарий"
          value={form.comment}
          onChange={(e) => handleChange("comment", e.target.value)}
          style={{ ...inputStyle, height: 80 }}
        />

        <button
          style={{
            ...buttonStyle,
            marginTop: 16,
          }}
          onClick={handleSubmit}
        >
          Оформить за {total} ₽
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  border: "1px solid #ddd",
  borderRadius: 10,
  fontSize: 16,
};

const buttonStyle = {
  width: "100%",
  padding: 14,
  background: "#2a7bf6",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontSize: 17,
};