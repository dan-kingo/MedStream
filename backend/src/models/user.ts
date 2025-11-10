// src/models/User.ts
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String }, // e.g., "Home", "Work"
  street: { type: String },
  city: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    location: { type: String },
    password: { type: String }, // optional for password-based login
    role: { type: String, enum: ['user', 'pharmacy', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    language: { type: String, enum: ['en', 'am'], default: 'en' },
    addresses: [addressSchema], // for delivery addresses
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
