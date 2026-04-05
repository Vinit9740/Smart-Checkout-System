import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, TextInput
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../services/api';

export default function CheckoutScreen({ route, navigation }) {
  const { sessionId, total } = route.params;
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('simulate');
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');

  const paymentMethods = [
    { id: 'simulate', label: 'Simulated Payment', icon: '🧪' },
    { id: 'cash', label: 'Cash at Counter', icon: '💵' },
    { id: 'upi', label: 'UPI', icon: '📱' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'wallet', label: 'Wallet', icon: '👛' },
  ];

  const triggerPaymentFlow = () => {
    if (method === 'cash') {
      Alert.alert(
        'Confirm Cash Payment',
        'Please confirm you will pay the cash amount directly at the counter before exiting.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: () => executePayment() }
        ]
      );
    } else if (method === 'upi' || method === 'card') {
      setPinModalVisible(true);
    } else {
      executePayment();
    }
  };

  const executePayment = async () => {
    setPinModalVisible(false);
    setLoading(true);
    try {
      const result = await api.pay(sessionId, method);
      
      // Stop loading strictly before navigation to prevent unmount React freezes
      setLoading(false);
      setPin('');

      // Navigate non-destructively to avoid race conditions
      navigation.navigate('ExitPass', {
        qrToken: result.data.qrToken,
        total: result.data.total,
        transactionId: result.data.payment.transaction_id,
      });
    } catch (err) {
      Alert.alert('Payment Failed', err.message);
      setLoading(false);
      setPin('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>₹{parseFloat(total).toFixed(2)}</Text>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodsContainer}>
          {paymentMethods.map((pm) => (
            <TouchableOpacity
              key={pm.id}
              style={[styles.methodCard, method === pm.id && styles.methodCardActive]}
              onPress={() => setMethod(pm.id)}
              activeOpacity={0.6}
            >
              <Text style={styles.methodIcon}>{pm.icon}</Text>
              <Text style={[styles.methodLabel, method === pm.id && styles.methodLabelActive]}>
                {pm.label}
              </Text>
              {method === pm.id && <View style={styles.methodCheck} />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.buttonDisabled]}
          onPress={triggerPaymentFlow}
          disabled={loading}
          activeOpacity={0.6}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.black} size="small" />
          ) : (
            <Text style={styles.payButtonText}>Pay ₹{parseFloat(total).toFixed(2)}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.secureText}>🔒 Secure payment processing</Text>
      </ScrollView>

      {/* PIN entry overlay (Replacing Native Modal) */}
      {pinModalVisible && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 999 }]}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter PIN</Text>
              <Text style={styles.modalDesc}>Please enter your {method.toUpperCase()} PIN to authorize ₹{parseFloat(total).toFixed(2)}</Text>
              
              <TextInput
                style={styles.pinInput}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
                value={pin}
                onChangeText={setPin}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel]} 
                  onPress={() => { setPinModalVisible(false); setPin(''); }}
                  activeOpacity={0.6}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonConfirm, pin.length < 4 && styles.buttonDisabled]} 
                  onPress={executePayment}
                  disabled={pin.length < 4}
                  activeOpacity={0.6}
                >
                  <Text style={styles.modalButtonConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  amountCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl * 1.5,
    alignItems: 'center',
    ...SHADOWS.card,
    marginBottom: SPACING.xl,
  },
  amountLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  amountValue: {
    fontSize: 44,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  methodsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  methodCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  methodIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  methodLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  methodLabelActive: {
    color: COLORS.textPrimary,
  },
  methodCheck: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md + 6,
    marginTop: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.black,
  },
  secureText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalDesc: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  pinInput: {
    backgroundColor: COLORS.surfaceLight,
    width: '100%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    fontSize: 24,
    letterSpacing: 12,
    textAlign: 'center',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.surfaceLight,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primary,
  },
  modalButtonCancelText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalButtonConfirmText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.black,
  },
});
