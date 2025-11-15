import { renderCatalog } from './catalog.js';
import { renderCart } from './cart.js';
import { renderOrder } from './order.js';

const tg = window.Telegram.WebApp;
tg.expand();

const app = document.getElementById('app');

function loadTab(tab) {
  console.log("TAB:", tab);

  if (tab === 'catalog') renderCatalog(app);
  if (tab === 'cart') renderCart(app);
  if (tab === 'order') renderOrder(app);

  document.querySelectorAll('#tabbar button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

document.querySelectorAll('#tabbar button').forEach(btn => {
  btn.addEventListener('click', () => loadTab(btn.dataset.tab));
});

loadTab('catalog');