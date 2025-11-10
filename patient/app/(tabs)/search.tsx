import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Searchbar, Card, Button, Chip, FAB } from 'react-native-paper';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';

import { theme } from '@/src/constants/theme';
import Header from '@/src/components/Header';
import { medicineAPI, notificationAPI } from '@/src/services/api';
import { useCartStore } from '@/src/store/cartStore';
import { SearchResult } from '@/src/types';

export default function SearchScreen() {
  const { addToCart, getTotalItems } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'distance'>('distance');
  const [deliveryFilter, setDeliveryFilter] = useState(false);
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
  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, sortBy, deliveryFilter, location]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const params: {
        query?: string;
        latitude?: number;
        longitude?: number;
        delivery?: boolean;
        sort?: 'price_asc' | 'price_desc';
      } = {};

      params.query = searchQuery.trim();

      if (deliveryFilter) {
        params.delivery = true;
      }

      if (sortBy !== 'distance') {
        params.sort = sortBy;
      }

      if (location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
      }

      console.log('Search params:', params);

      const response = await medicineAPI.searchMedicines(params);
      console.log('Search response:', response.data);
      setSearchResults(response.data);
    } catch (error: any) {
      console.error('Search error:', error);
      console.log('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      Toast.show({
        type: 'error',
        text1: 'Search Failed',
        text2: error.response?.data?.message || 'Unable to search medicines',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (result: SearchResult) => {
    addToCart(result.medicine, result.pharmacy, 1);
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${result.medicine.name} added to cart`,
    });
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Card style={styles.resultCard}>
        <Card.Content>
          <View style={styles.medicineHeader}>
            <View style={styles.medicineInfo}>
              <Text variant="titleMedium" numberOfLines={2}>
                {item.medicine.name}
              </Text>
              <Text variant="bodySmall" style={styles.medicineDetails}>
                {item.medicine.type} • {item.medicine.strength}
              </Text>
              <Text variant="titleLarge" style={styles.price}>
                ${item.price.toFixed(2)}
              </Text>
            </View>
            <View style={styles.medicineActions}>
              {item.medicine.requiresPrescription && (
                <Chip mode="outlined" compact style={styles.prescriptionChip}>
                  Rx Required
                </Chip>
              )}
              <Button
                mode="contained"
                compact
                onPress={() => handleAddToCart(item)}
                disabled={!item.available}
                style={styles.addButton}
              >
                {item.available ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </View>
          </View>
          
          <View style={styles.pharmacyInfo}>
            <View style={styles.pharmacyHeader}>
              <MaterialCommunityIcons name="store" size={16} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.pharmacyName}>
                {item.pharmacy.name}
              </Text>
            </View>
            <View style={styles.pharmacyDetails}>
              <Text variant="bodySmall" style={styles.pharmacyLocation}>
                {item.pharmacy.city}
              </Text>
              {item.pharmacy.distance && (
                <Text variant="bodySmall" style={styles.distance}>
                  {item.pharmacy.distance.toFixed(1)} km away
                </Text>
              )}
            </View>
            {item.pharmacy.deliveryAvailable && (
              <Chip mode="outlined" compact style={styles.deliveryChip}>
                Delivery Available
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const cartItemCount = getTotalItems();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Search Medicines" 
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

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search for medicines..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            loading={loading}
            style={styles.searchBar}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersSection}>
          <View style={styles.filterContainer}>
            <Chip
              mode={sortBy === 'distance' ? 'flat' : 'outlined'}
              onPress={() => setSortBy('distance')}
              style={styles.filterChip}
              selected={sortBy === 'distance'}
            >
              <Text style={styles.filterText}>Nearest</Text>
            </Chip>
          </View>
          
          <View style={styles.filterContainer}>
            <Chip
              mode={sortBy === 'price_asc' ? 'flat' : 'outlined'}
              onPress={() => setSortBy('price_asc')}
              style={styles.filterChip}
              selected={sortBy === 'price_asc'}
            >
              <Text style={styles.filterText}>Price: Low to High</Text>
            </Chip>
          </View>
          
          <View style={styles.filterContainer}>
            <Chip
              mode={sortBy === 'price_desc' ? 'flat' : 'outlined'}
              onPress={() => setSortBy('price_desc')}
              style={styles.filterChip}
              selected={sortBy === 'price_desc'}
            >
              <Text style={styles.filterText}>Price: High to Low</Text>
            </Chip>
          </View>
          
          <View style={styles.filterContainer}>
            <Chip
              mode={deliveryFilter ? 'flat' : 'outlined'}
              onPress={() => setDeliveryFilter(!deliveryFilter)}
              style={styles.filterChip}
              selected={deliveryFilter}
            >
              <Text style={styles.filterText}>Delivery Available</Text>
            </Chip>
          </View>
        </ScrollView>

        {/* Search Results */}
        {searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `${item.medicine._id}-${item.pharmacy._id}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        ) : searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="magnify" 
              size={64} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No medicines found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="magnify" 
              size={64} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              Search for Medicines
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Enter a medicine name to find available options from nearby pharmacies
            </Text>
          </View>
        )}
      </View>

      {/* Floating Action Button for Cart */}
      {cartItemCount > 0 && (
        <FAB
          icon="cart"
          label={cartItemCount.toString()}
          onPress={() => router.push('/(tabs)/cart')}
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
  searchSection: {
    paddingVertical: 16,
  },
  searchBar: {
    borderRadius: 12,
  },
  filtersSection: {
    marginBottom: 16,
  },
  filterContainer: {
    paddingVertical: 4,
  },
  filterText: {
    paddingHorizontal: 8,
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
  filterChip: {
    marginRight: 8,
    height: 40,
    justifyContent: 'center',
  },
  resultsList: {
    paddingBottom: 100,
  },
  resultCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
    marginRight: 12,
  },
  medicineDetails: {
    marginTop: 4,
    opacity: 0.7,
  },
  price: {
    marginTop: 8,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  medicineActions: {
    alignItems: 'flex-end',
  },
  prescriptionChip: {
    marginBottom: 8,
  },
  addButton: {
    borderRadius: 8,
  },
  pharmacyInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pharmacyName: {
    marginLeft: 8,
    fontWeight: '500',
  },
  pharmacyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pharmacyLocation: {
    opacity: 0.7,
  },
  distance: {
    opacity: 0.7,
  },
  deliveryChip: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});