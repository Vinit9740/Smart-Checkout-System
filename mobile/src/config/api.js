// Smart Checkout System — API Configuration

const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export default API_BASE_URL;

