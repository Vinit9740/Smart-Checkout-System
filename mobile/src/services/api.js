import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api';

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

const api = {
  // ── Auth ────────────────────────────────
  async register(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  // ── Session ─────────────────────────────
  async startSession() {
    const res = await fetch(`${API_BASE_URL}/session/start`, {
      method: 'POST',
      headers: await getHeaders(),
    });
    return handleResponse(res);
  },

  async getSession(id) {
    const res = await fetch(`${API_BASE_URL}/session/${id}`, {
      headers: await getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Products ────────────────────────────
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products`, {
      headers: await getHeaders(),
    });
    return handleResponse(res);
  },

  async getProductByBarcode(code) {
    const res = await fetch(`${API_BASE_URL}/products/barcode/${code}`, {
      headers: await getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Cart ────────────────────────────────
  async addToCart(sessionId, barcode) {
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ sessionId, barcode }),
    });
    return handleResponse(res);
  },

  async removeFromCart(sessionId, productId) {
    const res = await fetch(`${API_BASE_URL}/cart/remove`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ sessionId, productId }),
    });
    return handleResponse(res);
  },

  async deleteFromCart(sessionId, productId) {
    const res = await fetch(`${API_BASE_URL}/cart/delete`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ sessionId, productId }),
    });
    return handleResponse(res);
  },


  async getCart(sessionId) {
    const res = await fetch(`${API_BASE_URL}/cart/${sessionId}`, {
      headers: await getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Payment ─────────────────────────────
  async pay(sessionId, method = 'simulate') {
    const res = await fetch(`${API_BASE_URL}/payment/pay`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ sessionId, method }),
    });
    return handleResponse(res);
  },

  async getHistory() {
    const res = await fetch(`${API_BASE_URL}/payment/history`, {
      headers: await getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Exit ────────────────────────────────
  async verifyExit(qrToken) {
    const res = await fetch(`${API_BASE_URL}/exit/verify`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ qrToken }),
    });
    return handleResponse(res);
  },
};

export default api;
