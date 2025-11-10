import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { theme } from '@/src/constants/theme';
import Header from '@/src/components/Header';
import { medicineAPI } from '@/src/services/api';
import { useCartStore } from '@/src/store/cartStore';
import { Medicine, Pharmacy } from '@/src/types';
 
export default function PharmacyMedicinesScreen() {
  const params = useLocalSearchParams();
  const pharmacyId = params.pharmacyId as string;
  const pharmacyName = params.pharmacyName as string;
  
  const { addToCart } = useCartStore();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPharmacyMedicines();
  }, [pharmacyId]);

  // Update the fetchPharmacyMedicines function
const fetchPharmacyMedicines = async () => {
  try {
    // Validate pharmacyId
    if (!pharmacyId ) {
      throw new Error('Invalid pharmacy ID');
    }

    setLoading(true);
    setError(null);
    const response = await medicineAPI.getMedicinesByPharmacy(pharmacyId);
    
    // Ensure response data is an array
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format');
    }
    
    setMedicines(response.data);
  } catch (err) {
    console.error('Error fetching pharmacy medicines:', err);
    let errorMessage = 'Failed to fetch medicines for this pharmacy';
    if (typeof err === 'object' && err !== null) {
      if ('response' in err && typeof (err as any).response?.data?.message === 'string') {
        errorMessage = (err as any).response.data.message;
      } else if ('message' in err && typeof (err as any).message === 'string') {
        errorMessage = (err as any).message;
      }
    }
    setError(errorMessage);
    
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    setLoading(false);
  }
};

// Update the handleAddToCart function
const handleAddToCart = (medicine: Medicine) => {
  try {
    const pharmacy: Pharmacy = {
      _id: pharmacyId,
      name: pharmacyName,
      city: '', // Add required fields
      deliveryAvailable: false,
      rating: 0,
     };
    
    addToCart(medicine, pharmacy);
    Toast.show({
      type: 'success',
      text1: 'Added to cart', 
      text2: `${medicine.name} has been added to your cart`,
    });
  } catch (err) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to add item to cart',
    });
  }
};

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={pharmacyName}
        subtitle="Available medicines"
        showBack
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={40} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchPharmacyMedicines}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      ) : medicines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bottle-tonic-plus-outline" size={40} color={theme.colors.primary} />
          <Text style={styles.emptyText}>No medicines available in this pharmacy</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {medicines.map((medicine) => (
            <Card key={medicine._id} style={styles.medicineCard}>
              <Card.Content>
                <Text variant="titleMedium">{medicine.name}</Text>
                <Text variant="bodySmall" style={styles.medicineType}>
                  {medicine.type} • {medicine.strength}
                </Text>
                <Text variant="titleMedium" style={styles.medicinePrice}>
                  ${medicine.price.toFixed(2)}
                </Text>
                {medicine.requiresPrescription && (
                  <Chip mode="outlined" compact style={styles.prescriptionChip}>
                    Prescription Required
                  </Chip>
                )}
                <Text variant="bodySmall" style={styles.medicineDescription}>
                  {medicine.description || 'No description available'}
                </Text>
                <Button 
                  mode="contained" 
                  onPress={() => handleAddToCart(medicine)}
                  style={styles.addToCartButton}
                >
                  Add to Cart
                </Button>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  medicineType: {
    marginTop: 4,
    opacity: 0.7,
  },
  medicinePrice: {
    marginTop: 8,
    fontWeight: '600',
    marginBottom: 8,
  },
  medicineDescription: {
    marginTop: 8,
    marginBottom: 12,
  },
  prescriptionChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  addToCartButton: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: theme.colors.error,
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
});