import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Button, TextInput, Text, ActivityIndicator, Card, IconButton, Modal, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { profileAPI } from '@/src/services/api';
import Header from '@/src/components/Header';

interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

const ManageAddressesScreen = () => {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Form state
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [formErrors, setFormErrors] = useState({
    label: '',
    street: '',
    city: '',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getAddresses();
      setAddresses(response.addresses || []);
      setError('');
    } catch (err) {
      setError('Failed to load addresses');
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let valid = true;
    const errors = {
      label: '',
      street: '',
      city: '',
    };

    if (!label.trim()) {
      errors.label = 'Label is required';
      valid = false;
    }

    if (!street.trim()) {
      errors.street = 'Street address is required';
      valid = false;
    }

    if (!city.trim()) {
      errors.city = 'City is required';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const resetForm = () => {
    setLabel('');
    setStreet('');
    setCity('');
    setLatitude('');
    setLongitude('');
    setCurrentAddress(null);
    setEditMode(false);
    setFormErrors({
      label: '',
      street: '',
      city: '',
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const addressData = {
      label,
      street,
      city,
      ...(latitude && !isNaN(parseFloat(latitude)) && { latitude: parseFloat(latitude) }),
      ...(longitude && !isNaN(parseFloat(longitude)) && { longitude: parseFloat(longitude) }),
    };

    try {
      setLoading(true);
      if (editMode && currentAddress) {
        await profileAPI.updateAddress(currentAddress._id, addressData);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await profileAPI.addAddress(addressData);
        Alert.alert('Success', 'Address added successfully');
      }
      fetchAddresses();
      setModalVisible(false);
      resetForm();
    } catch (err) {
      console.error('Error saving address:', err);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await profileAPI.deleteAddress(id);
              fetchAddresses();
            } catch (err) {
              console.error('Error deleting address:', err);
              Alert.alert('Error', 'Failed to delete address. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openEditModal = (address: Address) => {
    setCurrentAddress(address);
    setLabel(address.label);
    setStreet(address.street);
    setCity(address.city);
    setLatitude(address.latitude?.toString() || '');
    setLongitude(address.longitude?.toString() || '');
    setEditMode(true);
    setModalVisible(true);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get your current location');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
      
      // Optionally reverse geocode to get address details
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const firstResult = geocode[0];
        setStreet(
          [firstResult.name, firstResult.street, firstResult.streetNumber]
            .filter(Boolean)
            .join(' ') || ''
        );
        setCity(firstResult.city || firstResult.region || '');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <Card style={styles.addressCard}>
      <Card.Content>
        <View style={styles.addressHeader}>
          <Text variant="titleMedium" style={styles.addressLabel}>
            {item.label}
          </Text>
          <View style={styles.addressActions}>
          
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDelete(item._id)}
            />
          </View>
        </View>
        <Text variant="bodyMedium">{item.street}</Text>
        <Text variant="bodyMedium">{item.city}</Text>
        {item.latitude && item.longitude && (
          <Text variant="bodySmall">
            Location: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading && addresses.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <>
      <Header title="Manage Addresses" showBack />
      
      <View style={styles.container}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No addresses saved</Text>
            }
          />
        )}

        <Button
          mode="contained"
          onPress={openAddModal}
          style={styles.addButton}
          icon="plus"
        >
          Add New Address
        </Button>

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => {
              setModalVisible(false);
              resetForm();
            }}
            contentContainerStyle={styles.modalContent}
          >
            <Text variant="titleLarge" style={styles.modalTitle}>
              {editMode ? 'Edit Address' : 'Add New Address'}
            </Text>
            
            <ScrollView>
              <TextInput
                label="Label (e.g., Home, Work)"
                value={label}
                onChangeText={setLabel}
                mode="outlined"
                style={styles.input}
                error={!!formErrors.label}
              />
              {formErrors.label ? (
                <Text style={styles.error}>{formErrors.label}</Text>
              ) : null}

              <TextInput
                label="Street Address"
                value={street}
                onChangeText={setStreet}
                mode="outlined"
                style={styles.input}
                error={!!formErrors.street}
              />
              {formErrors.street ? (
                <Text style={styles.error}>{formErrors.street}</Text>
              ) : null}

              <TextInput
                label="City"
                value={city}
                onChangeText={setCity}
                mode="outlined"
                style={styles.input}
                error={!!formErrors.city}
              />
              {formErrors.city ? (
                <Text style={styles.error}>{formErrors.city}</Text>
              ) : null}

              <View style={styles.locationContainer}>
                <TextInput
                  label="Latitude"
                  value={latitude}
                  onChangeText={setLatitude}
                  mode="outlined"
                  style={[styles.input, styles.locationInput]}
                  keyboardType="numeric"
                />

                <TextInput
                  label="Longitude"
                  value={longitude}
                  onChangeText={setLongitude}
                  mode="outlined"
                  style={[styles.input, styles.locationInput]}
                  keyboardType="numeric"
                />
              </View>

              <Button
                mode="outlined"
                onPress={getCurrentLocation}
                style={styles.locationButton}
                icon="crosshairs-gps"
                loading={locationLoading}
                disabled={locationLoading}
              >
                Use Current Location
              </Button>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                >
                  {editMode ? 'Update' : 'Save'}
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  listContent: {
    paddingBottom: 16,
  },
  addressCard: {
    marginBottom: 12,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontWeight: 'bold',
  },
  addressActions: {
    flexDirection: 'row',
  },
  addButton: {
    marginTop: 8,
    borderRadius: 4,
    paddingVertical: 6,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  locationInput: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  locationButton: {
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    marginLeft: 4,
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#6200ee',
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#6200ee',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
  },
});

export default ManageAddressesScreen;