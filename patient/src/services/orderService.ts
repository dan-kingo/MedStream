// src/services/orderService.ts
import axios from 'axios';
import { Order } from '@/src/types/order';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.224.216:3000/api';

export const createOrder = async (orderData: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Add authentication token if needed
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};