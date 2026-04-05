import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  Alert, ActivityIndicator, Animated, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../services/api';

// ─── Animated cart item card ───────────────────────────────────────────────
function CartItem({ item, onDecrement, onDelete, removing, deleting }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
  const release = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const isBusy = removing || deleting;

  const colors = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
  const accent = colors[Math.abs(item.product_id?.charCodeAt(item.product_id.length - 1) || 0) % colors.length];

  return (
    <Animated.View style={[styles.itemCard, { transform: [{ scale }] }]}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.itemBody}>
        {/* Top row */}
        <View style={styles.itemTopRow}>
          <View style={[styles.itemIconCircle, { backgroundColor: accent + '18' }]}>
            <Text style={styles.itemIcon}>🛍</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemMeta}>{item.category || 'General'} · {item.barcode}</Text>
          </View>
          {/* Delete entire item button */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            disabled={isBusy}
            onPressIn={press}
            onPressOut={release}
            activeOpacity={0.7}
          >
            {deleting
              ? <ActivityIndicator color={COLORS.error} size="small" />
              : <Text style={styles.deleteBtnText}>🗑</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Bottom row — price + qty controls */}
        <View style={styles.itemBottomRow}>
          <View>
            <Text style={styles.itemPrice}>₹{parseFloat(item.price_at_scan).toFixed(2)} each</Text>
            <Text style={[styles.itemSubtotal, { color: accent }]}>
              ₹{(parseFloat(item.price_at_scan) * item.quantity).toFixed(2)} total
            </Text>
          </View>

          {/* Quantity control */}
          <View style={styles.qtyControl}>
            <TouchableOpacity
              style={[styles.qtyBtn, isBusy && styles.qtyBtnDisabled]}
              onPress={onDecrement}
              disabled={isBusy}
              activeOpacity={0.7}
            >
              {removing
                ? <ActivityIndicator color={COLORS.primary} size="small" />
                : <Text style={styles.qtyBtnText}>−</Text>
              }
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <View style={[styles.qtyBtn, styles.qtyBtnPlus, styles.qtyBtnDisabled]}>
              <Text style={[styles.qtyBtnText, { color: COLORS.textMuted }]}>+</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main Cart Screen ─────────────────────────────────────────────────────
export default function CartScreen({ route, navigation }) {
  const { sessionId } = route.params;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);   // productId being decremented
  const [deleting, setDeleting] = useState(null);   // productId being fully deleted

  useFocusEffect(
    useCallback(() => { loadCart(); }, [])
  );

  const loadCart = async () => {
    try {
      setLoading(true);
      const result = await api.getCart(sessionId);
      setItems(result.data.items);
      setTotal(result.data.cartTotal);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Decrement qty by 1 (removes entirely if qty === 1)
  const handleDecrement = async (productId) => {
    setRemoving(productId);
    try {
      const result = await api.removeFromCart(sessionId, productId);
      setTotal(result.data.cartTotal);
      await loadCart();
    } catch (err) {
      Alert.alert('Remove Failed', err.message);
    } finally {
      setRemoving(null);
    }
  };

  // Delete the ENTIRE item regardless of quantity
  const handleDelete = (productId, productName) => {
    Alert.alert(
      'Remove Item',
      `Remove all "${productName}" from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            setDeleting(productId);
            try {
              const result = await api.deleteFromCart(sessionId, productId);
              setTotal(result.data.cartTotal);
              await loadCart();
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };


  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Cart 🛒</Text>
          <Text style={styles.headerCount}>
            {items.length} item{items.length !== 1 ? 's' : ''} · Session active
          </Text>
        </View>
        {items.length > 0 && (
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>₹{total.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>🛒</Text>
          </View>
          <Text style={styles.emptyTitle}>Cart is Empty</Text>
          <Text style={styles.emptyDesc}>Scan products to add them here</Text>
          <TouchableOpacity style={styles.scanButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.scanButtonText}>← Back to Scanner</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                onDecrement={() => handleDecrement(item.product_id)}
                onDelete={() => handleDelete(item.product_id, item.name)}
                removing={removing === item.product_id}
                deleting={deleting === item.product_id}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Checkout Footer */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Order Total</Text>
                <Text style={styles.totalItems}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
              </View>
              <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
            </View>

            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.continueScanBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <Text style={styles.continueScanText}>＋ Add More</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => navigation.navigate('Checkout', { sessionId, total })}
                activeOpacity={0.8}
              >
                <Text style={styles.checkoutText}>Checkout →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: SPACING.sm, color: COLORS.textMuted, fontSize: FONT_SIZES.sm },

  // ── Header ──
  header: {
    paddingTop: 56,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  totalBadge: {
    backgroundColor: COLORS.primaryGlow,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  totalBadgeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // ── List ──
  list: { padding: SPACING.md, paddingBottom: 200 },

  // ── Item Card ──
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.soft,
  },
  accentBar: {
    width: 4,
  },
  itemBody: {
    flex: 1,
    padding: SPACING.md,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  itemIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteBtnText: { fontSize: 16 },

  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  itemSubtotal: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
  },

  // ── Qty control ──
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPlus: { backgroundColor: COLORS.surfaceLight },
  qtyBtnDisabled: { opacity: 0.5 },
  qtyBtnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 22,
  },
  qtyValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },

  // ── Empty ──
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptyDesc: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.button,
  },
  scanButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalItems: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.primary,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  continueScanBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  continueScanText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  checkoutBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  checkoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: '#fff',
  },
});
