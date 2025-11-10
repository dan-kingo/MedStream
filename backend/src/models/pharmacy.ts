import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema(
  { 
    name: { type: String, required: true },
    ownerName: { type: String, required: false },
    licenseNumber: { type: String, required: false }, // remove unique from here
    phone: { type: String },
    email: { type: String },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    woreda: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: undefined,
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
    deliveryAvailable: { type: Boolean, default: false },
    rating: { type: Number, default: 4 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fix 1: Add unique sparse index for licenseNumber
pharmacySchema.index({ licenseNumber: 1 }, { unique: true, sparse: true });

// Fix 2: Retain geo index
pharmacySchema.index({ location: "2dsphere" }, { sparse: true });

export default mongoose.model("Pharmacy", pharmacySchema);
