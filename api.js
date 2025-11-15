const API = "http://localhost:3000";

export async function fetchCatalog() {
  const r = await fetch(`${API}/catalog`);
  return await r.json();
}

export async function createOrder(data) {
  const r = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  return await r.json();
}