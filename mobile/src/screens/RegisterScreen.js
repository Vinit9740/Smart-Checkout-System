import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  ScrollView, Animated, StatusBar,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// ─── Background doodles ────────────────────────────────────────────────────
function RegisterDoodles() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[dd.blob, { width: 220, height: 220, top: -60, left: -60, backgroundColor: 'rgba(6,182,212,0.07)' }]} />
      <View style={[dd.blob, { width: 160, height: 160, top: 80, right: -60, backgroundColor: 'rgba(99,102,241,0.06)' }]} />
      <View style={[dd.blob, { width: 100, height: 100, bottom: 160, left: -20, backgroundColor: 'rgba(16,185,129,0.06)' }]} />
      <View style={[dd.ring, { width: 70, height: 70, top: 250, right: 40, borderColor: 'rgba(99,102,241,0.13)' }]} />
      <View style={[dd.ring, { width: 45, height: 45, bottom: 250, right: 20, borderColor: 'rgba(6,182,212,0.11)' }]} />
      <View style={[dd.dot, { top: 180, left: 30, backgroundColor: 'rgba(99,102,241,0.18)' }]} />
      <View style={[dd.dot, { top: 310, right: 30, width: 6, height: 6, backgroundColor: 'rgba(6,182,212,0.18)' }]} />
    </View>
  );
}

const dd = StyleSheet.create({
  blob: { position: 'absolute', borderRadius: 999 },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 2, backgroundColor: 'transparent' },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
});

// ─── Animated floating input ───────────────────────────────────────────────
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
    <View style={inp.container}>
      <Text style={[inp.label, focused && { color: COLORS.primary }]}>{label}</Text>
      <Animated.View style={[inp.wrapper, { borderColor, shadowColor: COLORS.primary, shadowOpacity, shadowOffset: { width: 0, height: 0 }, shadowRadius: 8, elevation: focused ? 4 : 0 }]}>
        <Text style={[inp.icon, focused && { opacity: 1 }]}>{icon}</Text>
        <TextInput
          style={inp.field}
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

const inp = StyleSheet.create({
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

// ─── Main Register Screen ──────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const pressBtn = () => Animated.spring(scaleBtn, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const releaseBtn = () => Animated.spring(scaleBtn, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <RegisterDoodles />

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Brand */}
        <Animated.View style={[styles.brand, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoRing}>
            <Text style={styles.logoEmoji}>✨</Text>
          </View>
          <Text style={styles.brandTitle}>Join Smart Checkout</Text>
          <Text style={styles.brandSub}>Create your free account</Text>
        </Animated.View>

        {/* Perks row */}
        <Animated.View style={[styles.perksRow, { opacity: fadeAnim }]}>
          {[['🛒', 'Scan & Go'], ['💳', 'Fast Pay'], ['🧾', 'Receipts']].map(([icon, label]) => (
            <View key={label} style={styles.perk}>
              <Text style={styles.perkIcon}>{icon}</Text>
              <Text style={styles.perkLabel}>{label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <FloatInput
            label="Full Name"
            icon="👤"
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            autoCapitalize="words"
            autoCorrect={false}
          />
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
            placeholder="Min. 8 characters"
            secureTextEntry
          />

          {/* Password hint */}
          <View style={styles.passwordHint}>
            <Text style={styles.hintDot}>•</Text>
            <Text style={styles.hintText}>Use at least 8 characters with letters and numbers</Text>
          </View>

          <TouchableOpacity
            onPressIn={pressBtn}
            onPressOut={releaseBtn}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={1}
          >
            <Animated.View style={[styles.registerBtn, loading && styles.btnDisabled, { transform: [{ scale: scaleBtn }] }]}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.registerBtnText}>Create Account</Text>
                    <Text style={styles.registerBtnArrow}>✓</Text>
                  </View>
                )
              }
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Switch to login */}
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.switchText}>
            Already have an account?{'  '}
            <Text style={styles.switchLink}>Sign In →</Text>
          </Text>
        </TouchableOpacity>

        {/* Terms note */}
        <Text style={styles.terms}>
          By signing up, you agree to our Terms & Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },

  // ── Brand ──
  brand: { alignItems: 'center', marginBottom: SPACING.lg },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.soft,
  },
  logoEmoji: { fontSize: 34 },
  brandTitle: {
    fontSize: FONT_SIZES.xl + 2,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },

  // ── Perks ──
  perksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  perk: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.soft,
  },
  perkIcon: { fontSize: 20, marginBottom: 2 },
  perkLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary },

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

  // ── Password hint ──
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  hintDot: { color: COLORS.primary, fontSize: 16, lineHeight: 18 },
  hintText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, flex: 1 },

  // ── Button ──
  registerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.button,
  },
  btnDisabled: { opacity: 0.6 },
  registerBtnText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  registerBtnArrow: { fontSize: FONT_SIZES.lg, color: '#fff', fontWeight: '800' },

  // ── Switch ──
  switchText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
  switchLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  terms: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
  },
});
