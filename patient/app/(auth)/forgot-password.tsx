import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { theme } from '@/src/constants/theme';
import { authAPI } from '@/src/services/api';
import Header from '@/src/components/Header';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPasswordRequestOtp(phone);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Password reset code sent to your phone',
      });
      // Navigate to a password reset screen (you can create this)
      router.push({
        pathname: '/(auth)/reset-password',
        params: { phone }
      });

    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <Header title="Forgot Password" showBack />
    
    <KeyboardAwareScrollView 
      style={styles.content}
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent} // Add this
    >
     

      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.form}>
          <Text variant="headlineSmall" style={styles.title}>
            Reset Password
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Enter your phone number to receive a password reset code
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.form}>
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (error) setError('');
            }}
            placeholder="+2519xxxxxxxx"
            keyboardType="phone-pad"
            mode="outlined"
            error={!!error}
            style={styles.input}
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSendOtp}
            loading={loading}
            disabled={loading}
            style={styles.sendButton}
            contentStyle={styles.buttonContent}
          >
            Send Reset Code
          </Button>
        </Animated.View>
      </KeyboardAwareScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,

  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
  },
   scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  form: {
    alignItems: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 8,
  },
  sendButton: {
    marginTop: 24,
    width: '100%',
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});