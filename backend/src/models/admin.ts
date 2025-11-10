// src/models/Admin.ts
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['admin'], default: 'admin' }
}, { timestamps: true });

export const Admin = mongoose.model('Admin', adminSchema);
