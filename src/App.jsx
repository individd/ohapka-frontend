import { useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderPage from './pages/OrderPage.jsx';

const tabs = [
  { id: 'catalog', label: 'Каталог' },
  { id: 'cart', label: 'Корзина' },
  { id: 'order', label: 'Оформление' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.expand();
  }, []);

  return (
    <CartProvider>
      <div className="app-shell">
        <main className="app-main">
          {activeTab === 'catalog' && <CatalogPage />}
          {activeTab === 'cart' && <CartPage onGoToOrder={() => setActiveTab('order')} />}
          {activeTab === 'order' && <OrderPage />}
        </main>

        <div id="tabbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </CartProvider>
  );
}
