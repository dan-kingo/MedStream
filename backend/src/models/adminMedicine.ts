// src/models/AdminMedicine.ts
import mongoose from 'mongoose';

const adminMedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    strength: { type: String }, // e.g., "500mg"
    unit: { type: String, default: '' },
    type: { type: String, enum: ['Tablet', 'Syrup', 'Injection'], required: true },
    description: { type: String },
    requiresPrescription: { type: Boolean, default: false },
    relatedNames: [{ type: String }] // e.g., Panadol, Tylenol (optional)
  },
  { timestamps: true }
);

export const AdminMedicine = mongoose.model('AdminMedicine', adminMedicineSchema);
