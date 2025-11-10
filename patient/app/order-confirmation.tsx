import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, Card, Button, Divider, RadioButton, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { theme } from '@/src/constants/theme';
import Header from '@/src/components/Header';
import { useCartStore } from '@/src/store/cartStore';
import { orderAPI } from '@/src/services/api';
import { useAuthStore } from '@/src/store/authStore';

export default function OrderConfirmationScreen() {
  const { items, clearCart, getTotalPrice } = useCartStore();
  const { user } = useAuthStore();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD'>('COD');
  const [prescriptionImages, setPrescriptionImages] = useState<string[]>([]);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);

  const requiresPrescription = items.some(item => item.medicine.requiresPrescription);

  const handleSelectPrescription = async () => {
    try {
      setUploadingPrescription(true);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'We need access to your photos to upload prescriptions.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPrescriptionImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setUploadingPrescription(false);
    }
  };

  const handleCapturePrescription = async () => {
    try {
      setUploadingPrescription(true);
      
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'We need access to your camera to capture prescriptions.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPrescriptionImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setUploadingPrescription(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPrescriptionImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlaceOrder = async () => {
    if (deliveryType === 'delivery' && !address.trim()) {
      Alert.alert('Error', 'Please enter your delivery address');
      return;
    }

    if (requiresPrescription && prescriptionImages.length === 0) {
      Alert.alert('Prescription Required', 'Please upload a prescription image for the medicines that require it.');
      return;
    }

    setLoading(true);

    try {
      let location: { type: "Point"; coordinates: [number, number] } = {
        type: "Point",
        coordinates: [0, 0] // Default coordinates for pickup
      };

      if (deliveryType === 'delivery') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is needed for delivery');
          setLoading(false);
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        location = {
          type: "Point",
          coordinates: [currentLocation.coords.longitude, currentLocation.coords.latitude]
        };
      }

      const orderItems = items.map(item => ({
        medicineId: item.medicine._id,
        pharmacyId: item.pharmacy._id,
        quantity: item.quantity,
      }));

      // Use pharmacy address as default for pickup orders
      const defaultPickupAddress = items.length > 0 
        ? `Pickup at ${items[0].pharmacy.name}`
        : 'Pickup at pharmacy';

      const orderData = {
        items: orderItems,
        deliveryType,
        address: deliveryType === 'delivery' ? address : defaultPickupAddress,
        location,
        paymentMethod,
        notes,
        prescriptionImages: requiresPrescription ? prescriptionImages : undefined,
      };

      const response = await orderAPI.placeOrder(orderData);
      
      clearCart();
      
      Toast.show({
        type: 'success',
        text1: 'Order Placed Successfully',
        text2: 'Your order has been placed and is being processed',
      });
      
      router.replace('/(tabs)/orders');
    } catch (error: any) {
      console.error('Order creation failed:', error);
      const errorMessage = error.response?.data?.error || 'Failed to place order. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Order Confirmation"
        showBack
      />

      <ScrollView style={styles.content}>
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Delivery Options
            </Text>
            
            <RadioButton.Group 
              onValueChange={value => setDeliveryType(value as 'delivery' | 'pickup')} 
              value={deliveryType}
            >
              <View style={styles.radioOption}>
                <RadioButton value="delivery" />
                <View style={styles.radioTextContainer}>
                  <Text variant="bodyMedium">Home Delivery</Text>
                  <Text variant="bodySmall" style={styles.optionDescription}>
                    Get your order delivered to your location
                  </Text>
                </View>
              </View>
              
              <View style={styles.radioOption}>
                <RadioButton value="pickup" />
                <View style={styles.radioTextContainer}>
                  <Text variant="bodyMedium">Pickup from Pharmacy</Text>
                  <Text variant="bodySmall" style={styles.optionDescription}>
                    Collect your order at the pharmacy
                  </Text>
                </View>
              </View>
            </RadioButton.Group>

            {deliveryType === 'delivery' && (
              <TextInput
                mode="outlined"
                label="Delivery Address"
                placeholder="Enter your full address including landmarks"
                value={address}
                onChangeText={setAddress}
                style={styles.addressInput}
                multiline
                numberOfLines={3}
              />
            )}

            {deliveryType === 'pickup' && (
              <View style={styles.pickupInfo}>
                <MaterialCommunityIcons 
                  name="store-marker-outline" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text variant="bodySmall" style={styles.pickupText}>
                  {items.length > 0 
                    ? `You'll pickup your order at ${items[0].pharmacy.name}, ${items[0].pharmacy.address}`
                    : 'You can pickup your order at the selected pharmacy'}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {requiresPrescription && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Prescription Required
              </Text>
              <Text variant="bodySmall" style={styles.prescriptionNote}>
                Some items in your order require a prescription. Please upload a clear image of your prescription.
              </Text>
              
              <View style={styles.prescriptionButtons}>
                <Button 
                  mode="outlined" 
                  onPress={handleSelectPrescription}
                  loading={uploadingPrescription}
                  disabled={uploadingPrescription}
                  style={styles.prescriptionButton}
                  icon="image"
                >
                  Select Image
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={handleCapturePrescription}
                  loading={uploadingPrescription}
                  disabled={uploadingPrescription}
                  style={styles.prescriptionButton}
                  icon="camera"
                >
                  Take Photo
                </Button>
              </View>
              
              {prescriptionImages.length > 0 && (
                <View style={styles.prescriptionImagesContainer}>
                  <Text variant="bodySmall" style={styles.uploadedPrescriptionsText}>
                    Uploaded Prescriptions:
                  </Text>
                  <ScrollView horizontal>
                    {prescriptionImages.map((uri, index) => (
                      <View key={index} style={styles.prescriptionImageWrapper}>
                        <Image 
                          source={{ uri }} 
                          style={styles.prescriptionImage}
                        />
                        <Button 
                          mode="text" 
                          onPress={() => handleRemoveImage(index)}
                          style={styles.removeImageButton}
                          textColor={theme.colors.error}
                        >
                          Remove
                        </Button>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment Method
            </Text>
            <RadioButton.Group 
              onValueChange={value => setPaymentMethod(value as 'COD')} 
              value={paymentMethod}
            >
              <View style={styles.radioOption}>
                <RadioButton value="COD" />
                <View style={styles.radioTextContainer}>
                  <Text variant="bodyMedium">Cash on Delivery</Text>
                  <Text variant="bodySmall" style={styles.optionDescription}>
                    Pay when you receive your order
                  </Text>
                </View>
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Order Summary
            </Text>
            
            {items.map((item, index) => (
              <View key={`${item.medicine._id}-${item.pharmacy._id}`} style={styles.orderItem}>
                <View style={styles.orderItemDetails}>
                  <Text variant="bodyMedium">{item.medicine.name}</Text>
                  <Text variant="bodySmall" style={styles.orderItemPharmacy}>
                    {item.pharmacy.name} • {item.quantity} × ${item.medicine.price.toFixed(2)}
                  </Text>
                  {item.medicine.requiresPrescription && (
                    <Text variant="bodySmall" style={styles.prescriptionNote}>
                      Prescription required
                    </Text>
                  )}
                </View>
                <Text variant="bodyMedium" style={styles.itemTotal}>
                  ${(item.quantity * item.medicine.price).toFixed(2)}
                </Text>
                {index < items.length - 1 && <Divider style={styles.itemDivider} />}
              </View>
            ))}

            <Divider style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Subtotal</Text>
              <Text variant="bodyMedium">${getTotalPrice().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Delivery Fee</Text>
              <Text variant="bodyMedium">$0.00</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 8 }]}>
              <Text variant="titleLarge">Total</Text>
              <Text variant="titleLarge">${getTotalPrice().toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Additional Information
            </Text>
            <TextInput
              mode="outlined"
              label="Notes (optional)"
              placeholder="Any special instructions for your order?"
              value={notes}
              onChangeText={setNotes}
              style={styles.notesInput}
              multiline
              numberOfLines={3}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading}
          style={styles.placeOrderButton}
          contentStyle={styles.placeOrderButtonContent}
        >
          {loading ? 'Placing Order...' : 'Confirm Order'}
        </Button>
      </View>
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
    paddingBottom: 16,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  radioTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  optionDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  addressInput: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  pickupText: {
    marginLeft: 8,
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemPharmacy: {
    opacity: 0.7,
    marginTop: 2,
  },
  prescriptionNote: {
    color: theme.colors.error,
    marginTop: 4,
    fontSize: 12,
  },
  prescriptionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  prescriptionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  prescriptionImagesContainer: {
    marginTop: 12,
  },
  uploadedPrescriptionsText: {
    marginBottom: 8,
    opacity: 0.7,
  },
  prescriptionImageWrapper: {
    marginRight: 12,
    alignItems: 'center',
  },
  prescriptionImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
  },
  removeImageButton: {
    width: '100%',
  },
  itemTotal: {
    fontWeight: '500',
  },
  itemDivider: {
    marginVertical: 8,
  },
  summaryDivider: {
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notesInput: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    backgroundColor: theme.colors.background,
  },
  placeOrderButton: {
    borderRadius: 8,
  },
  placeOrderButtonContent: {
    height: 50,
  },
});