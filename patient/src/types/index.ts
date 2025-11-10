export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  role: string;
  isVerified: boolean;
  addresses: Address[];
  language: 'en' | 'am';
}

export interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface Medicine {
  _id: string;
  name: string;
  strength?: string;
  type: 'Tablet' | 'Syrup' | 'Injection';
  price: number;
  requiresPrescription: boolean;
  pharmacy?: Pharmacy;
  description?: string;
  available: boolean;
  unit?: string;
}

export interface Pharmacy {
  _id: string;
  name: string;
  city?: string;
  deliveryAvailable?: boolean;
  rating?: number;
  distance?: number;
  phone?: string;
  address?: string;
}

export interface OrderItem {
  medicine: Medicine;
  pharmacy: Pharmacy;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  deliveryType: 'delivery' | 'pickup';
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: 'Placed' | 'Accepted' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  prescriptionUrl?: string;
  paymentMethod: string;
  createdAt: string;
  notifications: Array<{
    type: string;
    message: string;
    sentAt: string;
  }>;
}

export interface CartItem {
  medicine: Medicine;
  pharmacy: Pharmacy;
  quantity: number;
}

export interface Notification {
  _id: string;
  message: string;
  type: 'sms' | 'in-app';
  isRead: boolean;
  createdAt: string;
}

export interface SearchResult {
  medicine: Medicine;
  price: number;
  pharmacy: Pharmacy;
  available: boolean;
}