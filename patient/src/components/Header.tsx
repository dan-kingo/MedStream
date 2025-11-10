import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { theme } from '@/src/constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode[];
  subtitle?: string;
}

export default function Header({
  title,
  showBack = false,
  actions = [],
  subtitle,
}: HeaderProps) {
  return (
    <Animated.View 
      entering={FadeInDown.duration(300)}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <Appbar.Header style={styles.header}>
        {showBack && (
          <Appbar.BackAction onPress={() => router.back()} />
        )}
        <Appbar.Content 
          title={title} 
          subtitle={subtitle}
          titleStyle={styles.title}
        />
        {actions.map((action, index) => (
          <View key={index}>{action}</View>
        ))}
      </Appbar.Header>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  header: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});