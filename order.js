import { getCart, clearCart } from './state.js';
import { createOrder } from './api.js';

export function renderOrder(app) {
  const cart = getCart();

  if (!cart.length) {
    app.innerHTML = `<div class="empty">Корзина пуста</div>`;
    return;
  }

  const tg = window.Telegram.WebApp;
  const user = tg?.initDataUnsafe?.user;

  const preName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';
  const prePhone = "";

  const total = cart.reduce((sum, item) => {
    return sum + item.price * (item.quantity / item.min);
  }, 0);

  const baseSlots = [
    { label: "10:00 - 12:00", startHour: 10 },
    { label: "12:00 - 14:00", startHour: 12 },
    { label: "14:00 - 16:00", startHour: 14 },
    { label: "16:00 - 18:00", startHour: 16 },
  ];

  app.innerHTML = `
    <div class="order-form">

      <div id="order-error" class="order-error"></div>

      <label>Имя</label>
      <input id="order-name" value="${preName}" />

      <label>Телефон</label>
      <input id="order-phone" placeholder="+7" value="${prePhone}" />

      <label>Адрес</label>
      <input id="order-address" placeholder="Улица, дом, квартира" />

      <label>Дата доставки</label>
      <div class="date-presets">
        <button class="date-preset" data-day="0">Сегодня</button>
        <button class="date-preset" data-day="1">Завтра</button>
        <button class="date-preset" data-day="2">Послезавтра</button>
      </div>
      <input id="order-date" type="date" />

      <label>Время</label>
      <select id="order-time"></select>

      <label>Комментарий</label>
      <textarea id="order-comment" placeholder="Подъезд, домофон, пожелания"></textarea>

      <div class="order-summary-block">
        ${cart
          .map(
            item =>
              `<div class="order-summary-item">
                ${item.name}: ${item.quantity} шт (${item.quantity / item.min} охапок)
                - ${item.price * (item.quantity / item.min)} ₽
              </div>`
          )
          .join('')}
        <div class="order-summary-total">Итого: ${total} ₽</div>
      </div>

      <button id="send-order-btn">Создать заказ</button>
    </div>
  `;

  const dateInput = document.getElementById("order-date");
  const timeSelect = document.getElementById("order-time");
  const errorBox = document.getElementById("order-error");
  const sendBtn = document.getElementById("send-order-btn");

  function setDateWithOffset(offsetDays) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    dateInput.value = `${yyyy}-${mm}-${dd}`;
    renderTimeOptions();
  }

  function renderTimeOptions() {
    const selectedStr = dateInput.value;
    const now = new Date();
    let slots = [...baseSlots];

    if (selectedStr) {
      const selected = new Date(selectedStr + "T00:00:00");
      const isToday = selected.toDateString() === now.toDateString();

      if (isToday) {
        slots = baseSlots.filter(slot => slot.startHour > now.getHours());
        if (!slots.length) {
          slots = [];
        }
      }
    }

    timeSelect.innerHTML = "";

    if (!slots.length) {
      const opt = document.createElement("option");
      opt.textContent = "Нет доступных слотов";
      opt.value = "";
      timeSelect.appendChild(opt);
      return;
    }

    slots.forEach(slot => {
      const opt = document.createElement("option");
      opt.textContent = slot.label;
      opt.value = slot.label;
      timeSelect.appendChild(opt);
    });
  }

  document.querySelectorAll(".date-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      const offset = Number(btn.dataset.day);
      setDateWithOffset(offset);
    });
  });

  dateInput.addEventListener("change", () => {
    renderTimeOptions();
  });

  setDateWithOffset(1);

  function validate(dto) {
    const errors = [];

    if (!dto.name || dto.name.trim().length < 2) {
      errors.push("Введите имя");
    }

    const digits = dto.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      errors.push("Введите корректный телефон");
    }

    if (!dto.address || dto.address.trim().length < 5) {
      errors.push("Введите адрес");
    }

    if (!dto.deliveryDate) {
      errors.push("Выберите дату доставки");
    }

    if (!dto.deliveryTime) {
      errors.push("Выберите время доставки");
    }

    return errors;
  }

  function openModal(dto) {
    const html = `
      <div class="modal-backdrop" id="dynamic-modal-backdrop"></div>
      <div class="modal" id="dynamic-modal">
        <div class="modal-content">
          <div class="modal-title">Подтвердите заказ</div>
          <div class="modal-body">
            <div class="modal-line"><b>Имя:</b> ${dto.name}</div>
            <div class="modal-line"><b>Телефон:</b> ${dto.phone}</div>
            <div class="modal-line"><b>Адрес:</b> ${dto.address}</div>
            <div class="modal-line"><b>Дата:</b> ${dto.deliveryDate}</div>
            <div class="modal-line"><b>Время:</b> ${dto.deliveryTime}</div>
            <div class="modal-line"><b>Комментарий:</b> ${dto.comment || "нет"}</div>
            <div class="modal-items-title">Состав заказа:</div>
            ${dto.items
              .map(
                item => `<div class="modal-line">
                  ${item.name}: ${item.quantity} шт (${item.bundles} охапок) - ${item.itemTotal} ₽
                </div>`
              )
              .join('')}
            <div class="modal-total">Итого: ${dto.total} ₽</div>
          </div>
          <div class="modal-actions">
            <button id="modal-cancel">Отмена</button>
            <button id="modal-confirm">Подтвердить</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
    document.getElementById("modal-cancel").onclick = closeModal;
    document.getElementById("dynamic-modal-backdrop").onclick = closeModal;
    document.getElementById("modal-confirm").onclick = async () => {
      await sendOrder(dto);
      closeModal();
    };
  }

  function closeModal() {
    document.getElementById("dynamic-modal")?.remove();
    document.getElementById("dynamic-modal-backdrop")?.remove();
    document.body.style.overflow = "";
  }

  function collectDto() {
    const name = document.getElementById("order-name").value;
    const phone = document.getElementById("order-phone").value;
    const address = document.getElementById("order-address").value;
    const deliveryDate = document.getElementById("order-date").value;
    const deliveryTime = document.getElementById("order-time").value;
    const comment = document.getElementById("order-comment").value;

    const dto = {
      name,
      phone,
      address,
      deliveryDate,
      deliveryTime,
      comment,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        min: item.min,
        bundles: item.quantity / item.min,
        priceForBundle: item.price,
        itemTotal: item.price * (item.quantity / item.min),
      })),
      total,
      tgUserId: user?.id || null,
      tgUsername: user?.username || null,
    };

    return dto;
  }

  async function sendOrder(dto) {
    sendBtn.disabled = true;
    sendBtn.textContent = "Создаём заказ...";

    try {
      const res = await createOrder(dto);
      clearCart();

      app.innerHTML = `
        <div class="order-success">
          Заказ создан!<br/>
          Номер: <b>${res.orderId}</b><br/>
          Менеджер свяжется с вами для подтверждения и оплаты.
        </div>
      `;
    } catch (e) {
      console.error(e);
      errorBox.textContent = "Ошибка при создании заказа. Попробуйте ещё раз.";
      sendBtn.disabled = false;
      sendBtn.textContent = "Создать заказ";
    }
  }

  sendBtn.addEventListener("click", () => {
    const dto = collectDto();
    const errors = validate(dto);

    if (errors.length) {
      errorBox.textContent = errors.join(" • ");
      return;
    }

    errorBox.textContent = "";
    openModal(dto);
  });
}