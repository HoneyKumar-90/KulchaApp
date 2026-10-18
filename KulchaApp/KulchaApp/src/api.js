import { API_URL } from './config';

let token = null;
export const setToken = (t) => { token = t; };

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors && Object.values(data.errors).flat()[0]) ||
      data?.title ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (fullName, phone, email, password) =>
    request('/api/auth/register', { method: 'POST', body: { fullName, phone, email, password } }),
  menu: () => request('/api/menu'),
  addresses: () => request('/api/addresses'),
  addAddress: (a) => request('/api/addresses', { method: 'POST', body: a }),
  placeOrder: (payload) => request('/api/orders', { method: 'POST', body: payload }),
  myOrders: () => request('/api/orders/mine'),
  cancelOrder: (id) => request(`/api/orders/${id}/cancel`, { method: 'POST' }),
};
