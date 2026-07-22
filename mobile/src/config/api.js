import { Platform } from 'react-native';

// Smart Checkout System — API Configuration

// ✅ PRODUCTION — Railway backend (works from anywhere)
// const API_BASE_URL = 'https://smart-checkout-system-production.up.railway.app/api';

// 🔧 LOCAL DEV — works for Expo emulator and local machine
const fallbackApiUrl = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : 'http://localhost:3000/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackApiUrl;

export default API_BASE_URL;

