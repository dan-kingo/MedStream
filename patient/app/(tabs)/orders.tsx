import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { theme } from '@/src/constants/theme';
import Header from '@/src/components/Header';
import { notificationAPI, orderAPI } from '@/src/services/api';
import { Order } from '@/src/types';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load orders',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'placed': return 'warning';
      case 'accepted': return 'primary';
      case 'out for delivery': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'placed': return 'clock-outline';
      case 'accepted': return 'check-circle-outline';
      case 'out for delivery': return 'truck-delivery-outline';
      case 'delivered': return 'package-variant';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getTotalAmount = (order: Order) => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="My Orders" actions={[
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
        ]}/>
        <View style={styles.loadingState}>
          <MaterialCommunityIcons 
            name="loading" 
            size={48} 
            color={theme.colors.primary} 
          />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading your orders...
          </Text>
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="My Orders" actions={[
                  <MaterialCommunityIcons 
                    key="notifications"
                    name="bell-outline" 
                    size={24} 
                    color={theme.colors.onSurface}
                    onPress={() => router.push('/notifications')}
                  />
                ]} />
        <View style={styles.emptyState}>
          <MaterialCommunityIcons 
            name="package-variant-closed" 
            size={64} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No orders yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            When you place orders, they'll appear here
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/search')}
            style={styles.shopButton}
          >
            Start Shopping
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="My Orders"  actions={[
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
        ]}/>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {orders.map((order, index) => (
          <Animated.View key={order._id} entering={FadeInDown.delay(index * 100).duration(300)}>
            <Card style={styles.orderCard}>
              <Card.Content>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text variant="titleMedium">
                      Order #{order._id.slice(-8)}
                    </Text>
                    <Text variant="bodySmall" style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Chip 
                    mode="flat" 
                    icon={getStatusIcon(order.status)}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          typeof theme.colors[getStatusColor(order.status) as keyof typeof theme.colors] === 'string'
                            ? theme.colors[getStatusColor(order.status) as keyof typeof theme.colors] as string
                            : theme.colors.surface as string,
                      },
                    ]}
                  >
                    {order.status}
                  </Chip>
                </View>

                <View style={styles.orderDetails}>
                  <Text variant="bodyMedium" style={styles.itemCount}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </Text>
                  <Text variant="bodyMedium" style={styles.deliveryType}>
                    {order.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup'}
                  </Text>
                </View>

                <View style={styles.orderItems}>
                  {order.items.slice(0, 2).map((item, itemIndex) => (
                    <Text key={itemIndex} variant="bodySmall" style={styles.itemName}>
                      • {item.medicine.name} × {item.quantity}
                    </Text>
                  ))}
                  {order.items.length > 2 && (
                    <Text variant="bodySmall" style={styles.moreItems}>
                      +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>

                <View style={styles.orderFooter}>
                  <Text variant="titleMedium" style={styles.totalAmount}>
                    Total: ${getTotalAmount(order).toFixed(2)}
                  </Text>
                  {/* <Button
                    mode="outlined"
                    compact
                    onPress={() => router.push(`/order-details/${order._id}`)}
                  >
                    View Details
                  </Button> */}
                </View>

                {order.prescriptionUrl && (
                  <View style={styles.prescriptionInfo}>
                    <MaterialCommunityIcons name="file-document" size={16} color={theme.colors.primary} />
                    <Text variant="bodySmall" style={styles.prescriptionText}>
                      Prescription uploaded
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </Animated.View>
        ))}
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
    paddingTop: 16,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  shopButton: {
    borderRadius: 12,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderDate: {
    marginTop: 4,
    opacity: 0.7,
  },
  statusChip: {
    marginLeft: 12,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemCount: {
    opacity: 0.7,
  },
  deliveryType: {
    opacity: 0.7,
  },
  orderItems: {
    marginBottom: 12,
  },
  itemName: {
    opacity: 0.8,
    marginBottom: 2,
  },
  moreItems: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  prescriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  prescriptionText: {
    marginLeft: 8,
    color: theme.colors.primary,
  },
});