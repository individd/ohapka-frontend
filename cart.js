import { getCart, clearCart, removeFromCart, updateCartQuantity } from './state.js';

export function renderCart(app) {
  const cart = getCart();

  if (!cart.length) {
    app.innerHTML = `<div class="empty">Корзина пуста</div>`;
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity / item.min),
    0
  );

  app.innerHTML = `
    <div class="cart">

      ${cart.map(item => {
        const itemTotal = item.price * (item.quantity / item.min);
        const maxBundles = item.stock / item.min;

        return `
          <div class="cart-item">
            <img src="${item.image}" class="cart-img" />

            <div class="cart-info">
              <div class="cart-name">${item.name}</div>

              <div class="qty-controls">
                <button class="qty-btn cart-minus" data-id="${item.id}">-</button>
                <span class="cart-qty-value" id="cqty-${item.id}">
                  ${item.quantity} шт (${item.quantity / item.min} охапки)
                </span>
                <button class="qty-btn cart-plus" data-id="${item.id}">+</button>
              </div>

              <div class="cart-price">${itemTotal} ₽</div>
              <div class="cart-stock">Осталось: ${maxBundles} охапок</div>

              <div class="limit-msg" id="cmsg-${item.id}"></div>
            </div>

            <button class="remove-btn" data-id="${item.id}">×</button>
          </div>
        `;
      }).join('')}

      <div class="cart-summary">
        <div>Итого:</div>
        <div>${total} ₽</div>
      </div>

      <button class="cart-to-order-btn">Перейти к оформлению</button>
    </div>
  `;

  function showLimitMessage(id, text) {
    const el = document.getElementById(`cmsg-${id}`);
    el.textContent = text;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1800);
  }

  document.querySelectorAll('.cart-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const item = cart.find(i => i.id === id);

      const newQty = item.quantity + item.min;

      if (newQty > item.stock) {
        showLimitMessage(id, "Максимум!");
        return;
      }

      updateCartQuantity(id, newQty);
      renderCart(app);
    });
  });

  document.querySelectorAll('.cart-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const item = cart.find(i => i.id === id);

      const newQty = Math.max(item.min, item.quantity - item.min);

      updateCartQuantity(id, newQty);
      renderCart(app);
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(Number(btn.dataset.id));
      renderCart(app);
    });
  });
}