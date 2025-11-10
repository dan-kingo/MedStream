// src/types/order.ts
export interface OrderItem {
  medicineId: string;
  pharmacyId: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryOption: 'delivery' | 'pickup';
  deliveryAddress?: string;
  pickupLocation?: string;
  status: 'Placed'| 'Accepted'| 'Out for Delivery' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}