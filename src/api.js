const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'API error');
  }
  return response.json();
}

export async function fetchCatalog() {
  return request(`${API}/catalog`);
}

export async function createOrder(data) {
  return request(`${API}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
