import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { theme } from '@/src/constants/theme';
import Header from '@/src/components/Header';
import { useCartStore } from '@/src/store/cartStore';

export default function CheckoutScreen() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  const handleCheckout = () => {
    // Implement your checkout logic here
    console.log('Proceeding to checkout with items:', items);
    // After successful checkout
    clearCart();
    router.push('/order-confirmation');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Checkout"
        showBack
      />

      <ScrollView style={styles.content}>
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cart-off" size={48} color={theme.colors.primary} />
            <Text variant="titleMedium" style={styles.emptyText}>
              Your cart is empty
            </Text>
            <Button 
              mode="contained" 
              onPress={() => router.back()}
              style={styles.continueShoppingButton}
            >
              Continue Shopping
            </Button>
          </View>
        ) : (
          <>
            {items.map((item, index) => (
              <Card key={`${item.medicine._id}-${item.pharmacy._id}`} style={styles.cartItem}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <Text variant="titleMedium">{item.medicine.name}</Text>
                    <Text variant="bodySmall" style={styles.pharmacyName}>
                      {item.pharmacy.name}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.itemDetails}>
                    {item.medicine.type} • {item.medicine.strength}
                  </Text>
                  {item.medicine.requiresPrescription && (
                    <Chip mode="outlined" compact style={styles.prescriptionChip}>
                      Prescription Required
                    </Chip>
                  )}
                  <View style={styles.itemFooter}>
                    <Text variant="titleMedium" style={styles.itemPrice}>
                      ${(item.medicine.price * item.quantity).toFixed(2)}
                    </Text>
                    <View style={styles.quantityControls}>
                      <Button 
                        mode="outlined" 
                        onPress={() => updateQuantity(item.medicine._id, item.pharmacy._id, item.quantity - 1)}
                        style={styles.quantityButton}
                      >
                        -
                      </Button>
                      <Text variant="bodyMedium" style={styles.quantityText}>
                        {item.quantity}
                      </Text>
                      <Button 
                        mode="outlined" 
                        onPress={() => updateQuantity(item.medicine._id, item.pharmacy._id, item.quantity + 1)}
                        style={styles.quantityButton}
                      >
                        +
                      </Button>
                    </View>
                  </View>
                  <Button 
                    mode="text" 
                    onPress={() => removeFromCart(item.medicine._id, item.pharmacy._id)}
                    textColor={theme.colors.error}
                    style={styles.removeButton}
                  >
                    Remove
                  </Button>
                </Card.Content>
                {index < items.length - 1 && <Divider />}
              </Card>
            ))}

            <Card style={styles.summaryCard}>
              <Card.Content>
                <View style={styles.summaryRow}>
                  <Text variant="titleMedium">Subtotal</Text>
                  <Text variant="titleMedium">${getTotalPrice().toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text variant="bodyMedium">Delivery</Text>
                  <Text variant="bodyMedium">$0.00</Text>
                </View>
                <Divider style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text variant="titleLarge">Total</Text>
                  <Text variant="titleLarge">${getTotalPrice().toFixed(2)}</Text>
                </View>
              </Card.Content>
            </Card>

            <Button 
              mode="contained" 
              onPress={handleCheckout}
              style={styles.checkoutButton}
              contentStyle={styles.checkoutButtonContent}
            >
              Proceed to Checkout
            </Button>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  continueShoppingButton: {
    width: '100%',
  },
  cartItem: {
    marginBottom: 16,
    borderRadius: 12,
  },
  itemHeader: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  pharmacyName: {
    opacity: 0.7,
  },
  itemDetails: {
    opacity: 0.7,
    marginBottom: 8,
  },
  prescriptionChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 12,
  },
  removeButton: {
    alignSelf: 'flex-end',
  },
  summaryCard: {
    marginBottom: 24,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryDivider: {
    marginVertical: 12,
  },
  checkoutButton: {
    marginBottom: 24,
    borderRadius: 8,
  },
  checkoutButtonContent: {
    height: 50,
  },
});