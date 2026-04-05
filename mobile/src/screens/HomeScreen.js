import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, ScrollView, Animated, Dimensions, StatusBar,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

// ─── Shopping doodle background SVG-like shapes drawn with Views ───────────
function DoodleBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Cart circles */}
      <View style={[doodle.circle, { top: -30, right: -30, width: 140, height: 140 }]} />
      <View style={[doodle.circle, { top: 80, right: 60, width: 60, height: 60 }]} />
      <View style={[doodle.circleBorder, { top: 40, left: -20, width: 90, height: 90 }]} />
      <View style={[doodle.circleBorder, { top: 160, right: 20, width: 40, height: 40 }]} />
      {/* Diagonal bars */}
      <View style={[doodle.bar, { top: 100, right: -10, transform: [{ rotate: '45deg' }] }]} />
      <View style={[doodle.bar, { top: 200, left: 10, width: 60, transform: [{ rotate: '-30deg' }] }]} />
      {/* Dots */}
      <View style={[doodle.dot, { top: 50, left: 40 }]} />
      <View style={[doodle.dot, { top: 130, left: 80, width: 6, height: 6 }]} />
      <View style={[doodle.dot, { top: 240, right: 50 }]} />
      {/* Shopping tag shape */}
      <View style={[doodle.tag, { top: 210, left: -10 }]} />
    </View>
  );
}

const doodle = StyleSheet.create({
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.doodle,
  },
  circleBorder: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.doodleStrong,
    backgroundColor: 'transparent',
  },
  bar: {
    position: 'absolute',
    width: 80,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.doodle,
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.doodleStrong,
  },
  tag: {
    position: 'absolute',
    width: 55,
    height: 35,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.doodleStrong,
    backgroundColor: 'transparent',
  },
});

// ─── Animated Press Card ──────────────────────────────────────────────────
function PressCard({ style, onPress, children, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => { Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start(); };
  const release = () => { Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start(); };
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={press}
      onPressOut={release}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Step pill ───────────────────────────────────────────────────────────
function StepCard({ icon, title, desc, color }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50 }).start();
  const release = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  return (
    <TouchableOpacity onPressIn={press} onPressOut={release} activeOpacity={1}>
      <Animated.View style={[styles.stepCard, { transform: [{ scale }] }]}>
        <View style={[styles.stepIconBg, { backgroundColor: color + '20' }]}>
          <Text style={styles.stepIcon}>{icon}</Text>
        </View>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [guideVisible, setGuideVisible] = useState(false);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, speed: 14, bounciness: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.getHistory();
      if (res.success) setHistory(res.data);
    } catch (err) {
      console.log('Failed to fetch history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchHistory);
    fetchHistory();
    return unsubscribe;
  }, [navigation]);

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const result = await api.startSession();
      const session = result.data.session;
      navigation.navigate('Scanner', { sessionId: session.id });
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Good Morning';
    if (h < 17) return '🌤 Good Afternoon';
    return '🌙 Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <DoodleBackground />
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.greetingText}>{greeting()}</Text>
          <Text style={styles.userName}>{user?.name || 'Shopper'} 👋</Text>
          <Text style={styles.headerSub}>Ready for a seamless shopping trip?</Text>
        </Animated.View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.pillBtn} onPress={() => setGuideVisible(true)} activeOpacity={0.7}>
            <Text style={styles.pillBtnIcon}>ℹ</Text>
            <Text style={styles.pillBtnText}>Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pillBtn, styles.pillBtnOutline]} onPress={logout} activeOpacity={0.7}>
            <Text style={[styles.pillBtnText, styles.pillBtnTextOutline]}>↩ Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero CTA Card */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.heroCard}>
            <View style={styles.heroCardDeco} />
            <View style={styles.heroCardDeco2} />
            <View style={styles.heroLeft}>
              <Text style={styles.heroTag}>🛍 Smart Checkout</Text>
              <Text style={styles.heroTitle}>Start Your{'\n'}Shopping Trip</Text>
              <Text style={styles.heroDesc}>Scan barcodes, manage your cart, and pay — all from this app.</Text>

              <PressCard
                style={[styles.startButton, loading && styles.buttonDisabled]}
                onPress={handleStartSession}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.startBtnIcon}>▶</Text>
                      <Text style={styles.startButtonText}>Start Session</Text>
                    </View>
                  )
                }
              </PressCard>
            </View>

            <View style={styles.heroEmoji}>
              <Text style={{ fontSize: 80 }}>🛒</Text>
            </View>
          </View>
        </Animated.View>

        {/* How it works — Step Cards */}
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepRow}>
          <StepCard icon="📷" title="Scan" desc="Point camera at any product barcode" color="#6366F1" />
          <StepCard icon="🛒" title="Cart" desc="Review and manage items easily" color="#06B6D4" />
          <StepCard icon="💳" title="Pay" desc="Instant digital checkout & receipt" color="#10B981" />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
            <Text style={[styles.statValue, { color: '#fff' }]}>₹{history.reduce((s, r) => s + parseFloat(r.amount || 0), 0).toFixed(0)}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🏪</Text>
            <Text style={styles.statLabel}>Smart Store</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{history.length}</Text></View>
          </View>

          {loadingHistory ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: SPACING.md }} />
          ) : history.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyDesc}>Start a session to make your first purchase.</Text>
            </View>
          ) : (
            history.map((record, idx) => (
              <HistoryCard
                key={record.id}
                record={record}
                idx={idx}
                onPress={() => navigation.navigate('Receipt', { receiptData: record })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Guide Modal ── */}
      {guideVisible && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 999 }]}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setGuideVisible(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <Text style={styles.modalTitle}>How to shop</Text>
              {[
                { n: '1', t: 'Start a session from the home screen.' },
                { n: '2', t: 'Point your camera at any product barcode to scan it.' },
                { n: '3', t: 'Review your cart and adjust item quantities.' },
                { n: '4', t: 'Proceed to checkout and pay digitally.' },
                { n: '5', t: 'Show the exit QR pass at the gate to leave the store.' },
              ].map(step => (
                <View key={step.n} style={styles.guideStep}>
                  <View style={styles.guideStepCircle}><Text style={styles.guideStepNum}>{step.n}</Text></View>
                  <Text style={styles.guideStepText}>{step.t}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.closeGuideButton} onPress={() => setGuideVisible(false)} activeOpacity={0.7}>
                <Text style={styles.closeGuideText}>Got it!</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── History Card with press animation ───────────────────────────────────
function HistoryCard({ record, onPress, idx }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const release = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const colors = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
  const accentColor = colors[idx % colors.length];

  return (
    <TouchableOpacity onPress={onPress} onPressIn={press} onPressOut={release} activeOpacity={1}>
      <Animated.View style={[styles.historyCard, { transform: [{ scale }] }]}>
        <View style={[styles.historyAccentBar, { backgroundColor: accentColor }]} />
        <View style={styles.historyContent}>
          <View style={styles.historyLeft}>
            <View style={[styles.historyIconCircle, { backgroundColor: accentColor + '18' }]}>
              <Text style={{ fontSize: 18 }}>🧾</Text>
            </View>
            <View>
              <Text style={styles.historyTxn} numberOfLines={1}>
                {record.transaction_id || `TXN-${record.id}`}
              </Text>
              <Text style={styles.historyDate}>
                {new Date(record.created_at || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>
          <View style={styles.historyRight}>
            <Text style={[styles.historyAmount, { color: accentColor }]}>₹{parseFloat(record.amount).toFixed(2)}</Text>
            <Text style={styles.historyViewBtn}>View →</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Header ──
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 56,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  greetingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 4,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryGlow,
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  pillBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  pillBtnIcon: { fontSize: 13, color: COLORS.primary },
  pillBtnText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  pillBtnTextOutline: {
    color: COLORS.textSecondary,
  },

  // ── Content ──
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  heroCardDeco: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  heroCardDeco2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    right: 60,
  },
  heroLeft: { flex: 1, paddingRight: SPACING.sm },
  heroTag: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xl + 2,
    fontWeight: '900',
    color: '#fff',
    marginBottom: SPACING.sm,
    lineHeight: 28,
  },
  heroDesc: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  heroEmoji: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -4,
  },
  startButton: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md + 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  startBtnIcon: { fontSize: 12, color: COLORS.primary, fontWeight: '900' },
  startButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },

  // ── Section title ──
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // ── Step Cards ──
  stepRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  stepCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.soft,
  },
  stepIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  stepIcon: { fontSize: 22 },
  stepTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.soft,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // ── History ──
  historySection: { marginBottom: SPACING.xl },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  badge: {
    backgroundColor: COLORS.primaryGlow,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary },

  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.soft,
  },
  historyAccentBar: {
    width: 4,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
  },
  historyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  historyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTxn: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
    maxWidth: 150,
  },
  historyDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    marginBottom: 2,
  },
  historyViewBtn: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
  },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.sm },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },

  // ── Guide Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  guideStepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideStepNum: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FONT_SIZES.sm,
  },
  guideStepText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  closeGuideButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.button,
  },
  closeGuideText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '800',

  },
});
