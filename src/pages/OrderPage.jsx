import { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { createOrder } from '../api.js';
import ConfirmModal from '../components/ConfirmModal.jsx';

const baseSlots = [
  { label: '10:00 - 12:00', startHour: 10 },
  { label: '12:00 - 14:00', startHour: 12 },
  { label: '14:00 - 16:00', startHour: 14 },
  { label: '16:00 - 18:00', startHour: 16 },
];

function formatDateInput(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function OrderPage() {
  const { cart, clearCart } = useCart();
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  const [name, setName] = useState(() => {
    if (!telegramUser) return '';
    const first = telegramUser.first_name ?? '';
    const last = telegramUser.last_name ?? '';
    return `${first} ${last}`.trim();
  });
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => formatDateInput(1));
  const [deliveryTime, setDeliveryTime] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [modalDto, setModalDto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * (item.quantity / item.min), 0),
    [cart],
  );

  const availableSlots = useMemo(() => {
    if (!deliveryDate) return baseSlots;
    const selected = new Date(`${deliveryDate}T00:00:00`);
    const now = new Date();
    const isToday = selected.toDateString() === now.toDateString();
    if (!isToday) return baseSlots;
    return baseSlots.filter((slot) => slot.startHour > now.getHours());
  }, [deliveryDate]);

  if (!cart.length) {
    return <div className="empty">Корзина пуста</div>;
  }

  const dto = {
    name,
    phone,
    address,
    deliveryDate,
    deliveryTime,
    comment,
    items: cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      min: item.min,
      bundles: item.quantity / item.min,
      priceForBundle: item.price,
      itemTotal: item.price * (item.quantity / item.min),
    })),
    total,
    tgUserId: telegramUser?.id ?? null,
    tgUsername: telegramUser?.username ?? null,
  };

  function validateOrder(data) {
    const errors = [];
    if (!data.name || data.name.trim().length < 2) errors.push('Введите имя');
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length < 10) errors.push('Введите корректный телефон');
    if (!data.address || data.address.trim().length < 5) errors.push('Введите адрес');
    if (!data.deliveryDate) errors.push('Выберите дату доставки');
    if (!data.deliveryTime) errors.push('Выберите время доставки');
    return errors;
  }

  async function handleConfirm() {
    if (!modalDto) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await createOrder(modalDto);
      clearCart();
      setSuccess(res.orderId);
      setModalDto(null);
    } catch (err) {
      setError(err.message || 'Ошибка при создании заказа. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit() {
    const errors = validateOrder(dto);
    if (errors.length) {
      setError(errors.join(' • '));
      return;
    }
    setError('');
    setModalDto(dto);
  }

  if (success) {
    return (
      <div className="order-success">
        Заказ создан!<br />
        Номер: <b>{success}</b><br />
        Менеджер свяжется с вами для подтверждения и оплаты.
      </div>
    );
  }

  return (
    <div className="order-form">
      {error && <div className="order-error">{error}</div>}

      <label>Имя</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />

      <label>Телефон</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7" />

      <label>Адрес</label>
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Улица, дом, квартира" />

      <label>Дата доставки</label>
      <div className="date-presets">
        {[
          { label: 'Сегодня', offset: 0 },
          { label: 'Завтра', offset: 1 },
          { label: 'Послезавтра', offset: 2 },
        ].map((preset) => (
          <button key={preset.offset} type="button" className="date-preset" onClick={() => setDeliveryDate(formatDateInput(preset.offset))}>
            {preset.label}
          </button>
        ))}
      </div>
      <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />

      <label>Время</label>
      <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)}>
        <option value="">Выберите время</option>
        {availableSlots.length === 0 && <option value="" disabled>Нет доступных слотов</option>}
        {availableSlots.map((slot) => (
          <option key={slot.label} value={slot.label}>
            {slot.label}
          </option>
        ))}
      </select>

      <label>Комментарий</label>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Подъезд, домофон, пожелания" />

      <div className="order-summary-block">
        {dto.items.map((item) => (
          <div className="order-summary-item" key={item.id}>
            {item.name}: {item.quantity} шт ({item.bundles} охапок) - {item.itemTotal} ₽
          </div>
        ))}
        <div className="order-summary-total">Итого: {dto.total} ₽</div>
      </div>

      <button id="send-order-btn" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Создаём заказ...' : 'Создать заказ'}
      </button>

      {modalDto && <ConfirmModal dto={modalDto} onCancel={() => setModalDto(null)} onConfirm={handleConfirm} />}
    </div>
  );
}
