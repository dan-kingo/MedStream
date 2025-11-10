import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, List, Switch, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { theme } from '@/src/constants/theme';
import Header from '@/src/components/Header';
import { useAuthStore } from '@/src/store/authStore';
import { notificationAPI, profileAPI } from '@/src/services/api';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
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
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.push('/login');
            Toast.show({
              type: 'success',
              text1: 'Signed Out',
              text2: 'You have been signed out successfully',
            });
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleManageAddresses = () => {
    router.push('/manage-addresses');
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          title: 'Edit Profile',
          description: 'Update your personal information',
          icon: 'account-edit',
          onPress: handleEditProfile,
        },
        {
          title: 'Change Password',
          description: 'Update your account password',
          icon: 'lock-outline',
          onPress: handleChangePassword,
        },
        {
          title: 'Manage Addresses',
          description: 'Add or edit delivery addresses',
          icon: 'map-marker-outline',
          onPress: handleManageAddresses,
        },
      ],
    },
    {
      title: 'Orders & History',
      items: [
        {
          title: 'Order History',
          description: 'View your past orders',
          icon: 'history',
          onPress: () => router.push('/orders'),
        },
      
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help & Support',
          description: 'Get help with your account',
          icon: 'help-circle-outline',
          onPress: () => router.push('/help'),
        },
        {
          title: 'Contact Us',
          description: 'Reach out to our support team',
          icon: 'phone-outline',
          onPress: () => router.push('/contact'),
        },
        {
          title: 'About',
          description: 'Learn more about MediMap',
          icon: 'information-outline',
          onPress: () => router.push('/about'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Profile" 
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Card style={styles.userCard}>
            <Card.Content>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons 
                    name="account" 
                    size={48} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.userDetails}>
                  <Text variant="headlineSmall" style={styles.userName}>
                    {user?.name || 'User'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.userPhone}>
                    {user?.phone}
                  </Text>
                  {user?.email && (
                    <Text variant="bodySmall" style={styles.userEmail}>
                      {user.email}
                    </Text>
                  )}
                  {user?.location && (
                    <Text variant="bodySmall" style={styles.userLocation}>
                      📍 {user.location}
                    </Text>
                  )}
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={handleEditProfile}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Settings Sections */}
        {profileSections.map((section, sectionIndex) => (
          <Animated.View 
            key={section.title}
            entering={FadeInDown.delay((sectionIndex + 1) * 200 + 400).duration(600)}
          >
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  {section.title}
                </Text>
                {section.items.map((item, itemIndex) => (
                  <View key={item.title}>
                    <List.Item
                      title={item.title}
                      description={item.description}
                      left={(props) => (
                        <List.Icon 
                          {...props} 
                          icon={item.icon} 
                          color={theme.colors.primary}
                        />
                      )}
                      right={(props) => (
                        <List.Icon {...props} icon="chevron-right" />
                      )}
                      onPress={item.onPress}
                      style={styles.listItem}
                    />
                    {itemIndex < section.items.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
          </Animated.View>
        ))}

        {/* Notifications Setting */}
        <Animated.View entering={FadeInDown.delay(1000).duration(600)}>
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Preferences
              </Text>
              <List.Item
                title="Push Notifications"
                description="Receive order updates and promotions"
                left={(props) => (
                  <List.Icon 
                    {...props} 
                    icon="bell-outline" 
                    color={theme.colors.primary}
                  />
                )}
                right={() => (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                  />
                )}
                style={styles.listItem}
              />
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Sign Out Button */}
        <Animated.View entering={FadeInDown.delay(1200).duration(600)}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.signOutButton}
            textColor={theme.colors.error}
            icon="logout"
          >
            Sign Out
          </Button>
        </Animated.View>

        {/* App Version */}
        <Animated.View entering={FadeInDown.delay(1400).duration(600)}>
          <Text variant="bodySmall" style={styles.versionText}>
            MediMap v1.0.0
          </Text>
        </Animated.View>
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
  userCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  userPhone: {
    opacity: 0.8,
    marginBottom: 2,
  },
  userEmail: {
    opacity: 0.7,
    marginBottom: 2,
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
  userLocation: {
    opacity: 0.7,
  },
  editButton: {
    borderRadius: 8,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.primary,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  divider: {
    marginVertical: 4,
  },
  signOutButton: {
    marginVertical: 24,
    borderRadius: 12,
    borderColor: theme.colors.error,
  },
  versionText: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 32,
  },
});