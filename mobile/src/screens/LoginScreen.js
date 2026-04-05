import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  Animated, StatusBar,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// ─── Background doodles for shopping feel ─────────────────────────────────
function LoginDoodles() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Large soft blobs */}
      <View style={[dd.blob, { width: 260, height: 260, top: -80, right: -80, backgroundColor: 'rgba(99,102,241,0.07)' }]} />
      <View style={[dd.blob, { width: 180, height: 180, top: 100, left: -70, backgroundColor: 'rgba(6,182,212,0.06)' }]} />
      <View style={[dd.blob, { width: 120, height: 120, bottom: 120, right: -30, backgroundColor: 'rgba(99,102,241,0.05)' }]} />
      {/* Dashed circles */}
      <View style={[dd.ring, { width: 80, height: 80, top: 160, right: 30, borderColor: 'rgba(99,102,241,0.15)' }]} />
      <View style={[dd.ring, { width: 50, height: 50, bottom: 200, left: 20, borderColor: 'rgba(6,182,212,0.12)' }]} />
      {/* Dots */}
      <View style={[dd.dot, { top: 200, left: 50, backgroundColor: 'rgba(99,102,241,0.2)' }]} />
      <View style={[dd.dot, { top: 340, right: 60, width: 6, height: 6, backgroundColor: 'rgba(6,182,212,0.2)' }]} />
      <View style={[dd.dot, { bottom: 180, left: 80, backgroundColor: 'rgba(16,185,129,0.18)' }]} />
      {/* Cart icon doodle */}
      <View style={[dd.cartBase, { bottom: 300, left: 22 }]} />
      <View style={[dd.cartHandle, { bottom: 320, left: 30 }]} />
    </View>
  );
}

const dd = StyleSheet.create({
  blob: { position: 'absolute', borderRadius: 999 },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 2, backgroundColor: 'transparent' },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  cartBase: { position: 'absolute', width: 36, height: 22, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(99,102,241,0.12)', backgroundColor: 'transparent' },
  cartHandle: { position: 'absolute', width: 24, height: 14, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 2, borderBottomWidth: 0, borderColor: 'rgba(99,102,241,0.12)', backgroundColor: 'transparent' },
});

// ─── Animated text input ─────────────────────────────────────────────────
function FloatInput({ label, icon, value, onChangeText, placeholder, keyboardType, secureTextEntry, autoCapitalize, autoCorrect }) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.cardBorder, COLORS.primary],
  });

  const shadowOpacity = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.15] });

  return (
    <View style={input.container}>
      <Text style={[input.label, focused && { color: COLORS.primary }]}>{label}</Text>
      <Animated.View style={[input.wrapper, { borderColor, shadowColor: COLORS.primary, shadowOpacity, shadowOffset: { width: 0, height: 0 }, shadowRadius: 8, elevation: focused ? 4 : 0 }]}>
        <Text style={[input.icon, focused && { opacity: 1 }]}>{icon}</Text>
        <TextInput
          style={input.field}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize || 'none'}
          autoCorrect={autoCorrect !== undefined ? autoCorrect : false}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </Animated.View>
    </View>
  );
}

const input = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  icon: { fontSize: 16, opacity: 0.5 },
  field: {
    flex: 1,
    paddingVertical: SPACING.md - 2,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
  },
});

// ─── Main Login Screen ─────────────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleBtn = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, speed: 12, bounciness: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const pressBtn = () => Animated.spring(scaleBtn, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const releaseBtn = () => Animated.spring(scaleBtn, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <LoginDoodles />

      <View style={styles.inner}>
        {/* Brand Section */}
        <Animated.View style={[styles.brand, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoRing}>
            <Text style={styles.logoEmoji}>🛒</Text>
          </View>
          <Text style={styles.brandTitle}>Smart Checkout</Text>
          <Text style={styles.brandSub}>Scan · Pay · Go</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.cardTitle}>Welcome back 👋</Text>
          <Text style={styles.cardSub}>Sign in to continue your smart shopping</Text>

          <FloatInput
            label="Email Address"
            icon="✉"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FloatInput
            label="Password"
            icon="🔒"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <TouchableOpacity
            onPressIn={pressBtn}
            onPressOut={releaseBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={1}
          >
            <Animated.View style={[styles.loginBtn, loading && styles.btnDisabled, { transform: [{ scale: scaleBtn }] }]}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.loginBtnText}>Sign In</Text>
                    <Text style={styles.loginBtnArrow}>→</Text>
                  </View>
                )
              }
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Switch to register */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
          <Text style={styles.switchText}>
            Don't have an account?{'  '}
            <Text style={styles.switchLink}>Create one →</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg },

  // ── Brand ──
  brand: { alignItems: 'center', marginBottom: SPACING.xl },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  logoEmoji: { fontSize: 38 },
  brandTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },

  // ── Button ──
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.button,
  },
  btnDisabled: { opacity: 0.6 },
  loginBtnText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  loginBtnArrow: { fontSize: FONT_SIZES.lg, color: '#fff', fontWeight: '800' },

  // ── Switch ──
  switchText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  switchLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
