import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { profileAPI } from '@/src/services/api';
import Header from '@/src/components/Header';

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [secureTextEntry, setSecureTextEntry] = useState({
    current: true,
    new: true,
    confirm: true,
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
      valid = false;
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
      valid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await profileAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      let errorMessage = 'Failed to change password. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = (field: 'current' | 'new' | 'confirm') => {
    setSecureTextEntry(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <>
      <Header title="Change Password" showBack />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Change Your Password</Text>
        <Text style={styles.subtitle}>
          For security, please enter your current password and then your new password.
        </Text>

        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={secureTextEntry.current}
          right={
            <TextInput.Icon
              icon={secureTextEntry.current ? 'eye-off' : 'eye'}
              onPress={() => toggleSecureEntry('current')}
            />
          }
          error={!!errors.currentPassword}
        />
        {errors.currentPassword ? (
          <Text style={styles.error}>{errors.currentPassword}</Text>
        ) : null}

        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={secureTextEntry.new}
          right={
            <TextInput.Icon
              icon={secureTextEntry.new ? 'eye-off' : 'eye'}
              onPress={() => toggleSecureEntry('new')}
            />
          }
          error={!!errors.newPassword}
        />
        {errors.newPassword ? (
          <Text style={styles.error}>{errors.newPassword}</Text>
        ) : null}

        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={secureTextEntry.confirm}
          right={
            <TextInput.Icon
              icon={secureTextEntry.confirm ? 'eye-off' : 'eye'}
              onPress={() => toggleSecureEntry('confirm')}
            />
          }
          error={!!errors.confirmPassword}
        />
        {errors.confirmPassword ? (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        ) : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          loading={loading}
          disabled={loading}
          contentStyle={styles.buttonContent}
        >
          {loading ? 'Updating...' : 'Change Password'}
        </Button>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    marginLeft: 5,
    fontSize: 12,
  },
});

export default ChangePasswordScreen;