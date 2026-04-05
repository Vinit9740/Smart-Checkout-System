import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function ReceiptScreen({ route, navigation }) {
  const { receiptData } = route.params;

  return (
    <View style={styles.container}>
      {/* ── Top Header ── */}
      <View style={styles.appHeader}>
        <Text style={styles.appHeaderTitle}>Transaction Details</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.6}>
          <Text style={styles.backButtonText}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Realistic Paper Receipt Wrapper ── */}
        <View style={styles.receiptPaper}>
          
          <View style={styles.receiptHeader}>
            <Text style={styles.storeName}>SMART CHECKOUT</Text>
            <Text style={styles.storeSub}>S U P E R M A R T</Text>
            <Text style={styles.storeDetails}>123 Tech Valley, Silicon Ave.</Text>
            <Text style={styles.storeDetails}>Tel: +1 (800) 555-0198</Text>
            <View style={styles.dashedLine} />
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Date: {new Date(receiptData.created_at || new Date()).toLocaleString()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>TXN: {receiptData.transaction_id || receiptData.id}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Method: {String(receiptData.method || 'CASH').toUpperCase()}</Text>
          </View>
          
          <View style={styles.dashedLine} />

          {/* Table Header */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableColQty, styles.tableHeadText]}>QTY</Text>
            <Text style={[styles.tableColName, styles.tableHeadText]}>ITEM</Text>
            <Text style={[styles.tableColPrice, styles.tableHeadText, { textAlign: 'right' }]}>PRICE</Text>
          </View>

          {/* Items */}
          {receiptData.items && receiptData.items.length > 0 ? (
            receiptData.items.map((cartItem, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableColQty}>{cartItem.quantity}</Text>
                <Text style={styles.tableColName} numberOfLines={2}>{cartItem.name}</Text>
                <Text style={[styles.tableColPrice, { textAlign: 'right' }]}>
                  ₹{parseFloat(cartItem.price_at_scan * cartItem.quantity).toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noItemsText}>No item specifics recorded.</Text>
          )}

          <View style={styles.dashedLine} />

          {/* Totals */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{parseFloat(receiptData.amount).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (0%)</Text>
            <Text style={styles.totalValue}>₹0.00</Text>
          </View>
          <View style={styles.totalRowHeavy}>
            <Text style={styles.totalLabelHeavy}>TOTAL</Text>
            <Text style={styles.totalValueHeavy}>₹{parseFloat(receiptData.amount).toFixed(2)}</Text>
          </View>

          <View style={styles.dashedLine} />

          <View style={styles.receiptFooter}>
            <Text style={styles.footerText}>*** THANK YOU FOR SHOPPING ***</Text>
            <Text style={styles.footerText}>PLEASE COME AGAIN</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Inherit dark mode background
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  appHeaderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  backButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  backButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 3,
  },
  receiptPaper: {
    backgroundColor: '#FFFFFF', // Force white to simulate paper receipt!
    borderRadius: 8,
    padding: SPACING.xl,
    ...SHADOWS.card,
    elevation: 20, // Extra depth so paper pops
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  storeName: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: '#000000',
  },
  storeSub: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  storeDetails: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.xs,
    color: '#555555',
  },
  dashedLine: {
    width: '100%',
    height: 1,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    borderStyle: 'dashed',
    marginVertical: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaText: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.xs,
    color: '#000000',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  tableHeadText: {
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
  },
  tableColQty: {
    width: 30,
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
    color: '#000000',
  },
  tableColName: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
    color: '#000000',
    paddingRight: SPACING.sm,
  },
  tableColPrice: {
    width: 70,
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
    color: '#000000',
  },
  noItemsText: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
    color: '#555',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
    color: '#000000',
  },
  totalValue: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
    color: '#000000',
  },
  totalRowHeavy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  totalLabelHeavy: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: '#000000',
  },
  totalValueHeavy: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: '#000000',
  },
  receiptFooter: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  footerText: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
});
