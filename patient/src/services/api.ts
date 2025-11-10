import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Address } from '../types';

const API_BASE_URL = 'http://192.168.224.216:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  requestOtp: (data: {
    phone: string;
    name?: string;
    email?: string;
    location?: string;
  }) => api.post('/auth/send-otp', data),

  verifyOtp: (phone: string, otp: string, password?:string) =>
    api.post('/auth/verify-otp', { phone, otp, password }),

  resendOtp: (phone: string) =>
    api.post('/auth/resend-otp', { phone }),

  setPassword: (password: string) =>
    api.post('/auth/set-password', { password }),

  loginWithPassword: (phone: string, password: string) =>
    api.post('/auth/login-with-password', { phone, password }),

  forgotPasswordRequestOtp: (phone: string) =>
    api.post('/forgot-password/request-otp', { phone }),
  
  resetPassword: (phone: string, otp: string, newPassword: string) =>
    api.post('/auth/reset-password', { phone, otp, newPassword }),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  getAddresses: async (): Promise<{ addresses: Address[] }> => {
    const response = await api.get('/profile/addresses');
    return response.data;
  },
  updateProfile: (data: {
    name?: string;
    email?: string;
    location?: string;
    language?: 'en' | 'am';
  }) => api.put('/profile', data),

  addAddress: (data: {
    label: string;
    street: string;
    city: string;
    latitude?: number;
    longitude?: number;
  }) => api.post('/profile/address', data),

  updateAddress: (id: string, data: any) =>
    api.put(`/profile/address/${id}`, data),

  deleteAddress: (id: string) =>
    api.delete(`/profile/address/${id}`),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => api.post('/profile/change-password', data),
};

// Medicine API
export const medicineAPI = {
  searchMedicines: (params: {
    query?: string;
    latitude?: number;
    longitude?: number;
    delivery?: boolean;
    sort?: 'price_asc' | 'price_desc';
  }) => api.get('/medicines/search', { params }),

  getPopularMedicines: () => api.get('/medicines/popular'),

  getMedicinesByPharmacy: (pharmacyId: string) => api.get(`/medicines/${pharmacyId}`),

  getMedicineDetails: (id: string) => api.get(`/medicines/${id}`),
};
 
// Home API
export const homeAPI = {
  getNearbyPharmacies: (latitude: number, longitude: number) =>
    api.get('/pharmacies/nearby', {
      params: { latitude, longitude },
    }),
};

// Order API
export const orderAPI = {
  placeOrder: (data: {
    items: Array<{
      medicineId: string;
      pharmacyId: string;
      quantity: number;
    }>;
    deliveryType: 'delivery' | 'pickup';
    address?: string;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
    paymentMethod?: string;
  }) => api.post('/orders', data),

  getMyOrders: () => api.get('/orders/my'),

  getOrderById: (id: string) => api.get(`/orders/${id}`),
};

// Notification API
export const notificationAPI = {
  getUnreadCount: () => api.get('/notifications/unread/count'),
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.get('/notifications/all'),
};

export default api;