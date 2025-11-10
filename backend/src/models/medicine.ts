// src/models/Medicine.ts
import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    strength: { type: String }, // e.g., "500mg"
    unit: { type: String, default: '' }, // e.g., "mg", "ml"
    type: { type: String, enum: ['Tablet', 'Syrup', 'Injection'], required: true },
    description: { type: String },
    requiresPrescription: { type: Boolean, default: false },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 0 },
    outOfStock: { type: Boolean, default: false },

    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Medicine', medicineSchema);
