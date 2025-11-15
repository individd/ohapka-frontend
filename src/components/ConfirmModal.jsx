export default function ConfirmModal({ dto, onCancel, onConfirm }) {
  return (
    <div className="modal-wrapper">
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal">
        <div className="modal-content">
          <div className="modal-title">Подтвердите заказ</div>
          <div className="modal-body">
            <div className="modal-line"><b>Имя:</b> {dto.name}</div>
            <div className="modal-line"><b>Телефон:</b> {dto.phone}</div>
            <div className="modal-line"><b>Адрес:</b> {dto.address}</div>
            <div className="modal-line"><b>Дата:</b> {dto.deliveryDate}</div>
            <div className="modal-line"><b>Время:</b> {dto.deliveryTime}</div>
            <div className="modal-line"><b>Комментарий:</b> {dto.comment || 'нет'}</div>
            <div className="modal-items-title">Состав заказа:</div>
            {dto.items.map((item) => (
              <div className="modal-line" key={item.id}>
                {item.name}: {item.quantity} шт ({item.bundles} охапок) - {item.itemTotal} ₽
              </div>
            ))}
            <div className="modal-total">Итого: {dto.total} ₽</div>
          </div>
          <div className="modal-actions">
            <button onClick={onCancel}>Отмена</button>
            <button onClick={onConfirm}>Подтвердить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
