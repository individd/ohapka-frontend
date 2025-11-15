import { useEffect, useState } from 'react';
import { fetchCatalog } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export default function CatalogPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchCatalog()
      .then((data) => {
        if (!isMounted) return;
        setProducts(data);
        const initial = {};
        data.forEach((p) => {
          initial[p.id] = p.min || 1;
        });
        setQuantities(initial);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Ошибка загрузки');
      })
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, []);

  function showMessage(id, text) {
    setMessages((prev) => ({ ...prev, [id]: text }));
    setTimeout(() => {
      setMessages((prev) => ({ ...prev, [id]: '' }));
    }, 1800);
  }

  function updateQuantity(id, delta, product) {
    setQuantities((prev) => {
      const next = Math.max(product.min, Math.min((prev[id] || product.min) + delta, product.stock));
      return { ...prev, [id]: next };
    });
  }

  function handleAdd(product) {
    const qty = quantities[product.id] || product.min;
    if (qty > product.stock) {
      showMessage(product.id, 'Максимум!');
      return;
    }

    addToCart(product, qty);
    setMessages((prev) => ({ ...prev, [product.id]: 'Добавлено' }));
    setTimeout(() => {
      setMessages((prev) => ({ ...prev, [product.id]: '' }));
    }, 1000);
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!products.length) {
    return <div className="empty">Каталог пуст</div>;
  }

  return (
    <div className="catalog">
      {products.map((product) => {
        const qty = quantities[product.id] || product.min;
        const isAtMax = qty >= product.stock;
        const price = product.price * (qty / product.min);
        return (
          <div className="product" key={product.id}>
            {product.images?.[0] && <img src={product.images[0]} className="product-img" alt={product.name} />}

            <div className="product-info">
              <div className="product-name">{product.name}</div>

              <div className="product-price">
                <span>{price}</span> ₽
              </div>

              <div className="qty-controls">
                <button
                  className="qty-btn minus"
                  onClick={() => updateQuantity(product.id, -product.step, product)}
                  disabled={qty <= product.min}
                >
                  -
                </button>
                <span className="qty-value">{qty}</span>
                <button
                  className={`qty-btn plus ${isAtMax ? 'disabled-btn' : ''}`}
                  disabled={isAtMax}
                  onClick={() => {
                    if (qty + product.step > product.stock) {
                      showMessage(product.id, 'Максимум!');
                      return;
                    }
                    updateQuantity(product.id, product.step, product);
                  }}
                >
                  +
                </button>
              </div>

              <button className="product-cart-btn" onClick={() => handleAdd(product)}>
                В корзину
              </button>

              {messages[product.id] && <div className="limit-msg show">{messages[product.id]}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
