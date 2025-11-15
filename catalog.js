import { fetchCatalog } from './api.js';
import { addToCart } from './state.js';

export async function renderCatalog(app) {
  app.innerHTML = `<div class="loading">Загрузка...</div>`;

  try {
    const products = await fetchCatalog();

    const qty = {};
    products.forEach(p => qty[p.id] = p.min);

    app.innerHTML = `
      <div class="catalog">
        ${products.map(p => `
          <div class="product">

            <img src="${p.images[0]}" class="product-img" />

            <div class="product-info">

              <div class="product-name">${p.name}</div>

              <div class="product-price">
                <span id="price-${p.id}">${p.price}</span> ₽
              </div>

              <div class="qty-controls">
                <button class="qty-btn minus" data-id="${p.id}">-</button>
                <span class="qty-value" id="qty-${p.id}">${p.min}</span>
                <button class="qty-btn plus" data-id="${p.id}">+</button>
              </div>

              <button class="product-cart-btn" data-id="${p.id}">В корзину</button>

              <div class="limit-msg" id="msg-${p.id}"></div>

            </div>
          </div>
        `).join('')}
      </div>
    `;

    function showLimitMessage(id, text) {
      const el = document.getElementById(`msg-${id}`);
      el.textContent = text;
      el.classList.add("show");
      setTimeout(() => el.classList.remove("show"), 1800);
    }

    function updatePlusButton(id, product) {
      const btn = document.querySelector(`.qty-btn.plus[data-id="${id}"]`);
      if (!btn) return;

      const isMax = qty[id] >= product.stock;

      if (isMax) {
        btn.disabled = true;
        btn.classList.add("disabled-btn");
      } else {
        btn.disabled = false;
        btn.classList.remove("disabled-btn");
      }
    }

    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const p = products.find(x => x.id === id);

        if (qty[id] + p.step > p.stock) {
          showLimitMessage(id, "Максимум!");
          return;
        }

        qty[id] += p.step;

        document.getElementById(`qty-${id}`).textContent = qty[id];
        document.getElementById(`price-${id}`).textContent =
          p.price * (qty[id] / p.min);

        updatePlusButton(id, p);
      });
    });

    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const p = products.find(x => x.id === id);

        qty[id] = Math.max(p.min, qty[id] - p.step);

        document.getElementById(`qty-${id}`).textContent = qty[id];
        document.getElementById(`price-${id}`).textContent =
          p.price * (qty[id] / p.min);

        updatePlusButton(id, p);
      });
    });

    document.querySelectorAll('.product-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        const p = products.find(x => x.id === id);

        addToCart(p, qty[id]);
        updatePlusButton(id, p);
      });
    });

    products.forEach(p => updatePlusButton(p.id, p));

  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="error">Ошибка загрузки</div>`;
  }
}