import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function ExitPassScreen({ route, navigation }) {
  const { qrToken, total, transactionId } = route.params;

  const handleDone = () => {
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successDesc}>Show this QR code at the exit gate</Text>
        </View>

        {/* QR Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrBorder}>
            <QRCode
              value={qrToken}
              size={180}
              color={COLORS.black}
              backgroundColor={COLORS.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValue}>₹{parseFloat(total).toFixed(2)}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Transaction</Text>
              <Text style={styles.detailValueSmall}>{transactionId}</Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionIcon}>📋</Text>
          <Text style={styles.instructionText}>
            Present this QR code to the store exit scanner for verification. The code is valid for this session only.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.6}
        >
          <Text style={styles.doneButtonText}>Back to App</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successIcon: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.success,
  },
  successDesc: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  qrCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl + 8,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.card,
    marginBottom: SPACING.xl,
  },
  qrBorder: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    width: '100%',
    marginVertical: SPACING.lg,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.cardBorder,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONT_SIZES.xl + 4,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailValueSmall: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  instructionCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  instructionIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  instructionText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md + 4,
    alignItems: 'center',
    ...SHADOWS.button,
  },
  doneButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
});
