import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('smart_checkout_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeUrl = (base, path) => {
  const trimmedBase = (base || '').replace(/\/$/, '');
  const trimmedPath = path.replace(/^\/+/, '/');
  const url = trimmedBase ? `${trimmedBase}${trimmedPath}` : trimmedPath;
  return url.replace(/\/api\/api\//g, '/api/');
};

const request = async (path, options = {}) => {
  const headers = await getAuthHeaders();
  const url = normalizeUrl(API_BASE_URL, path);
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    payload = { message: text || 'Request failed' };
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
};

const api = {
  async register(name, email, password) {
    const payload = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    return { data: payload.data };
  },

  async login(email, password) {
    const payload = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return { data: payload.data };
  },

  async startSession() {
    const payload = await request('/api/session/start', { method: 'POST' });
    return { data: payload.data?.session || payload.data };
  },

  async getSession(id) {
    const payload = await request(`/api/session/${id}`);
    return { data: payload.data?.session || payload.data };
  },

  async getProducts() {
    const payload = await request('/api/products');
    return { data: payload.data?.products || payload.data };
  },

  async getProductByBarcode(code) {
    const payload = await request(`/api/products/barcode/${code}`);
    return { data: payload.data?.product || payload.data };
  },

  async addToCart(sessionId, barcode) {
    const payload = await request('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ sessionId, barcode }),
    });
    return { data: payload.data };
  },

  async getCart(sessionId) {
    const payload = await request(`/api/cart/${sessionId}`);
    return { data: payload.data || { items: [], cartTotal: 0, itemCount: 0 } };
  },

  async removeFromCart(sessionId, productId) {
    const payload = await request('/api/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ sessionId, productId }),
    });
    return { data: payload.data };
  },

  async deleteFromCart(sessionId, productId) {
    const payload = await request('/api/cart/delete', {
      method: 'POST',
      body: JSON.stringify({ sessionId, productId }),
    });
    return { data: payload.data };
  },

  async pay(sessionId, method = 'simulate') {
    const payload = await request('/api/payment/pay', {
      method: 'POST',
      body: JSON.stringify({ sessionId, method }),
    });
    return { data: payload.data };
  },

  async getHistory() {
    const payload = await request('/api/payment/history');
    return { data: payload.data || [] };
  },
};

export default api;
