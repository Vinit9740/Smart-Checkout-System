import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ExitPassScreen from '../screens/ExitPassScreen';
import ReceiptScreen from '../screens/ReceiptScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: COLORS.background,
  },
  headerTintColor: COLORS.textPrimary,
  headerTitleStyle: {
    fontWeight: '800',
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: COLORS.background,
  },
};

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // splash / loading handled by Expo
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {isAuthenticated ? (
          // ── Authenticated Stack ──
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scan Products', headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ExitPass" component={ExitPassScreen} options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ headerShown: false, presentation: 'modal' }} />
          </>
        ) : (
          // ── Auth Stack ──
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
