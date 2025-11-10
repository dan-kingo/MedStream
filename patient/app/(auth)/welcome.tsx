import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { theme } from '@/src/constants/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View 
        entering={FadeInUp.delay(200).duration(800)}
        style={styles.header}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons 
            name="medical-bag" 
            size={80} 
            color={theme.colors.primary} 
          />
        </View>
        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
          MediMap
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Find medicines from nearby pharmacies
        </Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(400).duration(800)}
        style={styles.features}
      >
        <View style={styles.feature}>
          <MaterialCommunityIcons name="map-search" size={32} color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.featureText}>
            Search nearby pharmacies
          </Text>
        </View>
        <View style={styles.feature}>
          <MaterialCommunityIcons name="pill" size={32} color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.featureText}>
            Find medicines easily
          </Text>
        </View>
        <View style={styles.feature}>
          <MaterialCommunityIcons name="truck-delivery" size={32} color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.featureText}>
            Home delivery available
          </Text>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(600).duration(800)}
        style={styles.buttons}
      >
        <Button
          mode="contained"
          onPress={() => router.push('/(auth)')}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
        >
          Get Started
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.push('/(auth)/login')}
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
        >
          I already have an account
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  buttons: {
    paddingBottom: 32,
  },
  primaryButton: {
    marginBottom: 16,
    borderRadius: 12,
  },
  secondaryButton: {
    marginBottom: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});