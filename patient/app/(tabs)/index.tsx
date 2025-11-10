import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, FAB, Button } from 'react-native-paper';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';

import { theme } from '@/src/constants/theme';
import Header from '@/src/components/Header';
import { medicineAPI, homeAPI, notificationAPI } from '@/src/services/api';
import { useAuthStore } from '@/src/store/authStore';
import { useCartStore } from '@/src/store/cartStore';
import { Medicine, Pharmacy } from '@/src/types';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { getTotalItems } = useCartStore();
  
  const [popularMedicines, setPopularMedicines] = useState<Medicine[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
const [unreadCount, setUnreadCount] = useState(0);

// Add this useEffect to fetch unread notifications count
useEffect(() => {
  const fetchUnreadCount = async () => {
    try {
      // Assuming you have an API endpoint to get unread notifications count
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  };

  fetchUnreadCount();
}, []);

  useEffect(()  => {
    getCurrentLocation();
    fetchPopularMedicines();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyPharmacies();
    }
  }, [location]);

  const getCurrentLocation = async () => {
    try {
      setLocationError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Location permission is required to find nearby pharmacies',
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log('Location error:', error);
      setLocationError('Unable to get your location');
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Unable to get your location',
      });
    }
  };

  const fetchPopularMedicines = async () => {
    try {
      const response = await medicineAPI.getPopularMedicines();
      setPopularMedicines(response.data);
    } catch (error) {
      console.error('Error fetching popular medicines:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch popular medicines',
      });
    }
  };

  const fetchNearbyPharmacies = async () => {
    if (!location) {
      setLocationError('Location not available');
      return;
    }
    
    try {
      setLoading(true);
      const response = await homeAPI.getNearbyPharmacies(location.latitude, location.longitude);
      setNearbyPharmacies(response.data.pharmacies);
      setLocationError(null);
    } catch (error: any) {
      console.error('Error fetching nearby pharmacies:', error);
      setNearbyPharmacies([]);
      
      if (error.response?.status === 400) {
        setLocationError('Please enable location services');
      } else {
        setLocationError('Failed to fetch nearby pharmacies');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPopularMedicines(),
        getCurrentLocation(),
        fetchNearbyPharmacies(),
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePharmacyPress = (pharmacy: Pharmacy) => {
    router.push({
      pathname: '/pharmacy-medicines',
      params: { 
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name 
      },
    });
  };

  const cartItemCount = getTotalItems();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={`Hello, ${user?.name || 'User'}!`}
        subtitle="Find medicines from nearby pharmacies"
      actions={[
  <View key="notifications" style={{ position: 'relative' }}>
    <MaterialCommunityIcons 
      name="bell-outline" 
      size={32} 
      color={theme.colors.onSurface}
      onPress={() => router.push('/notifications')}
    />
    {unreadCount > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </Text>
      </View>
    )}
  </View>
]}

      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.quickActions}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <Card style={styles.actionCard} onPress={() => router.push('/search')}>
              <Card.Content style={styles.actionContent}>
                <MaterialCommunityIcons name="magnify" size={32} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.actionText}>
                  Search Medicine
                </Text>
              </Card.Content>
            </Card>
           
          </View>
        </Animated.View>

        {/* Popular Medicines */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Popular Medicines
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularMedicines.map((medicine) => (
              <Card key={medicine._id} style={styles.medicineCard}>
                <Card.Content>
                  <Text variant="titleSmall" numberOfLines={2}>
                    {medicine.name}
                  </Text>
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
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Nearby Pharmacies */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Nearby Pharmacies
            </Text>
            <Button 
              mode="text" 
              onPress={handleRefresh}
              textColor={theme.colors.primary}
            >
              Refresh
            </Button>
          </View>
          
          {loading ? (
            <ActivityIndicator animating={true} color={theme.colors.primary} />
          ) : locationError ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons 
                name="map-marker-off" 
                size={40} 
                color={theme.colors.error} 
              />
              <Text style={styles.errorText}>{locationError}</Text>
              <Text 
                style={[styles.errorActionText, { color: theme.colors.primary }]}
                onPress={getCurrentLocation}
              >
                Try Again
              </Text>
            </View>
          ) : nearbyPharmacies.length > 0 ? (
            nearbyPharmacies.map((pharmacy) => (
              <Card 
                key={pharmacy._id} 
                style={styles.pharmacyCard}
                onPress={() => handlePharmacyPress(pharmacy)}
              >
                <Card.Content>
                  <View style={styles.pharmacyHeader}>
                    <Text variant="titleSmall">{pharmacy.name}</Text>
                    {pharmacy.distance && (
                      <Text variant="bodySmall" style={styles.distance}>
                        {pharmacy.distance.toFixed(1)} km
                      </Text>
                    )}
                  </View>
                  <Text variant="bodySmall" style={styles.pharmacyLocation}>
                    {pharmacy.city}
                  </Text>
                  <View style={styles.pharmacyFeatures}>
                    {pharmacy.deliveryAvailable && (
                      <Chip mode="outlined" compact>
                        Delivery Available
                      </Chip>
                    )}
                    {pharmacy.rating && (
                      <View style={styles.rating}>
                        <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
                        <Text variant="bodySmall">{pharmacy.rating}</Text>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons 
                name="map-marker-question" 
                size={40} 
                color={theme.colors.error} 
              />
              <Text style={styles.errorText}>No nearby pharmacies found</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button for Cart */}
      {cartItemCount > 0 && (
        <FAB
          icon="cart"
          label={cartItemCount.toString()}
          onPress={() => router.push('/checkout')}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        />
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
  quickActions: {
    marginBottom: 24,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionText: {
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: 28,
  },
  seeAll: {
    fontWeight: '500',
  },
  medicineCard: {
    width: 180,
    marginRight: 12,
    marginBottom: 8,
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
  prescriptionChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pharmacyCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    opacity: 0.7,
  },
  pharmacyLocation: {
    marginTop: 4,
    opacity: 0.7,
  },
  pharmacyFeatures: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    textAlign: 'center',
    color: theme.colors.error,
  },
  badge: {
  position: 'absolute',
  right: 0,
  top:-8,
  backgroundColor: theme.colors.error,
  borderRadius: 10,
  width: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
badgeText: {
  color: 'white',
  fontSize: 10,
  fontWeight: 'bold',
},
  errorActionText: {
    marginTop: 10,
    fontWeight: '500',
  },
});