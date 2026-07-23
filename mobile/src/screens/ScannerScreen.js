import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Vibration,
  Platform, TextInput, Animated, ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../services/api';

// ─── Simulated product shortcuts (barcodes matching the seeded DB products) ─
const SIMULATE_PRODUCTS = [
  { label: '🍞 Bread',     barcode: '8901234567890' },
  { label: '🥛 Milk',      barcode: '8901234567891' },
  { label: '🍚 Rice',      barcode: '8901234567892' },
  { label: '🫒 Olive Oil', barcode: '8901234567893' },
  { label: '🍫 Choco',    barcode: '8901234567894' },
];

const isWeb = Platform.OS === 'web';

// ─── Main Scanner Screen ──────────────────────────────────────────────────────
export default function ScannerScreen({ route, navigation }) {
  const { sessionId } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastProduct, setLastProduct] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [flash, setFlash] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (lastProduct) {
      Animated.sequence([
        Animated.timing(bannerAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(bannerAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [lastProduct]);

  const loadCart = async () => {
    try {
      const result = await api.getCart(sessionId);
      setCartCount(result.data.items?.length || 0);
      setCartTotal(result.data.cartTotal || 0);
    } catch (_) {
      // Empty cart is fine
    }
  };

  const handleScan = async (barcode) => {
    if (scanned) return;
    setScanned(true);
    if (!isWeb) Vibration.vibrate(100);
    setManualCode('');

    try {
      const result = await api.addToCart(sessionId, barcode);
      setLastProduct(result.data.product);
      setCartTotal(result.data.cartTotal);
      setCartCount((prev) => prev + 1);
    } catch (err) {
      Alert.alert('Scan Error', err.message);
    } finally {
      setTimeout(() => setScanned(false), 1800);
    }
  };

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (!code) { Alert.alert('Error', 'Please enter a barcode.'); return; }
    handleScan(code);
  };

  // ── No permission yet ─────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permText}>Requesting camera access…</Text>
      </View>
    );
  }

  // ── Permission denied ─────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        {isWeb && (
          <View style={styles.webHeader}>
            <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.headerBackText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.webHeaderTitle}>Scan Products</Text>
            <View style={{ width: 44 }} />
          </View>
        )}
        <View style={styles.permCard}>
          <Text style={styles.permIcon}>📷</Text>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permDesc}>
            Smart Checkout needs camera access to scan product barcodes.
            {isWeb ? '\n\nClick below and allow camera access in your browser.' : ''}
          </Text>
          <TouchableOpacity style={styles.permButton} onPress={requestPermission} activeOpacity={0.8}>
            <Text style={styles.permButtonText}>Grant Camera Permission</Text>
          </TouchableOpacity>

          {isWeb && (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or use demo buttons</Text>
                <View style={styles.dividerLine} />
              </View>
              <View style={styles.simGrid}>
                {SIMULATE_PRODUCTS.map((p) => (
                  <TouchableOpacity key={p.barcode} style={styles.simBtn} onPress={() => handleScan(p.barcode)} activeOpacity={0.75}>
                    <Text style={styles.simBtnLabel}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {isWeb && (
          <View style={styles.bottomBar}>
            <View style={styles.cartInfo}>
              <Text style={styles.cartLabel}>Cart</Text>
              <Text style={styles.cartCount}>{cartCount} items</Text>
              <Text style={styles.cartTotal}>₹{cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.viewCartButton} onPress={() => navigation.navigate('Cart', { sessionId })} activeOpacity={0.8}>
              <Text style={styles.viewCartText}>View Cart →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ── WEB LAYOUT ────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  if (isWeb) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.webHeader}>
          <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.headerBackText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.webHeaderTitle}>Scan Products</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.webScrollContent} showsVerticalScrollIndicator={false}>
          {/* Camera card */}
          <View style={styles.webCameraCard}>
            <CameraView
              style={styles.webCamera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
              }}
              onBarcodeScanned={scanned ? undefined : ({ data }) => handleScan(data)}
            >
              {/* Corner guides */}
              <View style={styles.webScanOverlay}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <Text style={styles.webScanHint}>Point camera at a barcode</Text>
              </View>
            </CameraView>

            {/* Scanned banner inside card */}
            {lastProduct && (
              <Animated.View style={[styles.webScannedBanner, { opacity: bannerAnim }]}>
                <Text style={styles.scannedCheck}>✓ Added:</Text>
                <Text style={styles.scannedName}>{lastProduct.name}</Text>
                <Text style={styles.scannedPrice}>₹{lastProduct.price}</Text>
              </Animated.View>
            )}
          </View>

          {/* Quick scan section */}
          <Text style={styles.webSectionLabel}>Quick Scan — Demo Products</Text>
          <View style={styles.simGrid}>
            {SIMULATE_PRODUCTS.map((p) => (
              <TouchableOpacity key={p.barcode} style={styles.simBtn} onPress={() => handleScan(p.barcode)} activeOpacity={0.75}>
                <Text style={styles.simBtnLabel}>{p.label}</Text>
                <Text style={styles.simBtnBarcode}>{p.barcode}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manual barcode entry */}
          <TouchableOpacity style={styles.manualToggle} onPress={() => setShowManual(!showManual)} activeOpacity={0.7}>
            <Text style={styles.manualToggleText}>{showManual ? '▲ Hide' : '▼ Manual barcode entry'}</Text>
          </TouchableOpacity>
          {showManual && (
            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="e.g. 8901234567890"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="default"
                onSubmitEditing={handleManualSubmit}
                returnKeyType="search"
                autoFocus
              />
              <TouchableOpacity style={styles.manualBtn} onPress={handleManualSubmit} activeOpacity={0.8}>
                <Text style={styles.manualBtnText}>Scan ↵</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartLabel}>Cart</Text>
            <Text style={styles.cartCount}>{cartCount} items</Text>
            <Text style={styles.cartTotal}>₹{cartTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.viewCartButton} onPress={() => navigation.navigate('Cart', { sessionId })} activeOpacity={0.8}>
            <Text style={styles.viewCartText}>View Cart →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ── NATIVE LAYOUT ─────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flash}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
        }}
        onBarcodeScanned={scanned ? undefined : ({ data }) => handleScan(data)}
      >
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanWindow}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={[styles.overlayBottom, { alignItems: 'center', paddingTop: 10 }]}>
            <Text style={styles.nativeScanHint}>Quick Scan (Demo):</Text>
            <View style={styles.nativeSimRow}>
              {SIMULATE_PRODUCTS.slice(0, 3).map((p) => (
                <TouchableOpacity
                  key={p.barcode}
                  style={styles.nativeSimBtn}
                  onPress={() => handleScan(p.barcode)}
                >
                  <Text style={styles.nativeSimBtnText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </CameraView>

      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Flash toggle */}
      <TouchableOpacity style={styles.flashButton} onPress={() => setFlash(!flash)} activeOpacity={0.8}>
        <Text style={styles.flashButtonText}>{flash ? '💡' : '🔦'}</Text>
      </TouchableOpacity>

      {/* Scanned banner */}
      {lastProduct && (
        <Animated.View style={[styles.nativeScannedBanner, { opacity: bannerAnim }]}>
          <Text style={styles.scannedCheck}>✓</Text>
          <View style={styles.scannedInfo}>
            <Text style={styles.scannedName}>{lastProduct.name}</Text>
            <Text style={styles.scannedPrice}>₹{lastProduct.price}</Text>
          </View>
        </Animated.View>
      )}

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.cartInfo}>
          <Text style={styles.cartLabel}>Cart</Text>
          <Text style={styles.cartCount}>{cartCount} items</Text>
          <Text style={styles.cartTotal}>₹{cartTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.viewCartButton} onPress={() => navigation.navigate('Cart', { sessionId })} activeOpacity={0.8}>
          <Text style={styles.viewCartText}>View Cart →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },

  // ── Web header ──
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    ...SHADOWS.soft,
  },
  webHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 26,
  },

  // ── Web scroll content ──
  webScrollContent: {
    padding: SPACING.lg,
    paddingBottom: 20,
  },

  // ── Web camera card ──
  webCameraCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: '#000',
    height: 280,
    ...SHADOWS.card,
  },
  webCamera: { flex: 1 },
  webScanOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  webScanHint: {
    position: 'absolute',
    bottom: 14,
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  webScannedBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(16,185,129,0.92)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  // ── Web quick scan ──
  webSectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  simGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  simBtn: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    minWidth: 100,
    ...SHADOWS.soft,
  },
  simBtnLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 1,
  },
  simBtnBarcode: {
    fontSize: FONT_SIZES.xs - 1,
    color: COLORS.textMuted,
  },

  // ── Manual entry ──
  manualToggle: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
    paddingVertical: 4,
  },
  manualToggleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  manualRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  manualInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md - 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  manualBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.button,
  },
  manualBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FONT_SIZES.md,
  },

  // ── Divider (permission-denied fallback) ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '600' },

  // ── Native camera ──
  camera: { flex: 1 },
  overlay: { flex: 1 },
  overlayTop: { flex: 1, backgroundColor: COLORS.overlay },
  overlayMiddle: { flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: COLORS.overlay },
  scanWindow: { width: 260, height: 260, position: 'relative' },
  overlayBottom: { flex: 1, backgroundColor: COLORS.overlay },

  // ── Corner brackets (shared web + native) ──
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },

  // ── Native overlay buttons ──
  nativeScanHint: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    marginBottom: 8,
    fontWeight: '600',
  },
  nativeSimRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  nativeSimBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  nativeSimBtnText: { fontWeight: 'bold', color: '#fff' },

  // ── Native floating buttons ──
  backButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.lg,
    backgroundColor: COLORS.card,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
    zIndex: 10,
  },
  backButtonText: { color: COLORS.primary, fontSize: 24, lineHeight: 28, fontWeight: 'bold' },
  flashButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.lg,
    backgroundColor: COLORS.card,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.card,
    zIndex: 10,
  },
  flashButtonText: { fontSize: 20, lineHeight: 28 },

  // ── Scanned banners ──
  nativeScannedBanner: {
    position: 'absolute',
    top: 110,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.success,
    ...SHADOWS.card,
    zIndex: 10,
  },
  scannedInfo: { flex: 1 },
  scannedCheck: {
    fontSize: 18,
    color: COLORS.success,
    marginRight: SPACING.sm,
    fontWeight: '800',
  },
  scannedName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  scannedPrice: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },

  // ── Bottom bar ──
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  cartInfo: { flex: 1 },
  cartLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cartCount: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, fontWeight: '700' },
  cartTotal: { fontSize: FONT_SIZES.lg, color: COLORS.primary, fontWeight: '800' },
  viewCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.button,
  },
  viewCartText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },

  // ── Permission screen ──
  permText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md, textAlign: 'center' },
  permCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permIcon: { fontSize: 64, marginBottom: SPACING.lg },
  permTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  permDesc: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  permButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.button,
  },
  permButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
});
