// src/models/Order.ts
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    deliveryType: { type: String, enum: ['delivery', 'pickup'], default: 'pickup' },
    address: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }, // for delivery
    },
    status: {
      type: String,
      enum: ['Placed', 'Accepted', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    notifications: [
  {
    type: { type: String },
    message: String,
    sentAt: Date,
  }
],
    prescriptionUrl: { type: String },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ location: '2dsphere' }, { sparse: true });

export default mongoose.model('Order', orderSchema);
