import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../services/api';

export default function ScannerScreen({ route, navigation }) {
  const { sessionId } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastProduct, setLastProduct] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const result = await api.getCart(sessionId);
      setCartCount(result.data.items.length);
      setCartTotal(result.data.cartTotal);
    } catch (err) {
      // Cart may be empty, that's ok
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(100);

    try {
      const result = await api.addToCart(sessionId, data);
      setLastProduct(result.data.product);
      setCartTotal(result.data.cartTotal);
      setCartCount((prev) => prev + 1);

      setTimeout(() => setScanned(false), 1500);
    } catch (err) {
      Alert.alert('Scan Error', err.message);
      setTimeout(() => setScanned(false), 1500);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permCard}>
          <Text style={styles.permIcon}>📷</Text>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permDesc}>
            Smart Checkout needs camera access to scan product barcodes.
          </Text>
          <TouchableOpacity style={styles.permButton} onPress={requestPermission} activeOpacity={0.8}>
            <Text style={styles.permButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flash}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Scan overlay */}
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
          <View style={[styles.overlayBottom, { alignItems: 'center', paddingTop: 20 }]}>
            <TouchableOpacity 
              style={{ backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 }}
              onPress={() => handleBarCodeScanned({ data: '8901234567890' })}
            >
              <Text style={{ fontWeight: 'bold' }}>Simulate Scan (Test)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Flash Button */}
      <TouchableOpacity 
        style={styles.flashButton} 
        onPress={() => setFlash(!flash)}
        activeOpacity={0.8}
      >
        <Text style={styles.flashButtonText}>{flash ? '💡' : '🔦'}</Text>
      </TouchableOpacity>

      {/* Last scanned item banner */}
      {lastProduct && (
        <View style={styles.scannedBanner}>
          <Text style={styles.scannedCheck}>✓</Text>
          <View style={styles.scannedInfo}>
            <Text style={styles.scannedName}>{lastProduct.name}</Text>
            <Text style={styles.scannedPrice}>₹{lastProduct.price}</Text>
          </View>
        </View>
      )}

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.cartInfo}>
          <Text style={styles.cartLabel}>Cart</Text>
          <Text style={styles.cartCount}>{cartCount} items</Text>
          <Text style={styles.cartTotal}>₹{cartTotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.viewCartButton}
          onPress={() => navigation.navigate('Cart', { sessionId })}
          activeOpacity={0.8}
        >
          <Text style={styles.viewCartText}>View Cart →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  camera: {
    flex: 1,
  },
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
  backButtonText: {
    color: COLORS.primary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 'bold',
  },
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
  flashButtonText: {
    fontSize: 20,
    lineHeight: 28,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  scanWindow: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: 4, borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: 4, borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: 4, borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: 4, borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  scannedBanner: {
    position: 'absolute',
    top: 60,
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
  },
  scannedCheck: {
    fontSize: 24,
    color: COLORS.success,
    marginRight: SPACING.md,
  },
  scannedInfo: {
    flex: 1,
  },
  scannedName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scannedPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
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
  cartInfo: {
    flex: 1,
  },
  cartLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cartCount: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  cartTotal: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '800',
  },
  viewCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.button,
  },
  viewCartText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.black,
  },
  permText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginTop: 100,
  },
  permCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  permTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
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
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  permButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.black,
  },
});

