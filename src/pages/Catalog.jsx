import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../api";

export default function Catalog() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    fetchProducts().then((data) => setProducts(data));
  }, []);

  if (!products) {
    return <div style={{ padding: 16 }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}