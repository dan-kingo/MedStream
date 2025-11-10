import { z } from 'zod';

export const registerPharmacySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const loginPharmacySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});


export const pharmacyProfileSchema = z.object({
  name: z.string().min(2, "Pharmacy name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  licenseNumber: z.string().min(3, "License/Registration number is required"),
  phone: z.string().min(9, "Phone number is required"),
  email: z.string().email("Invalid email format"),
  address: z.string().optional(),
  city: z.string().min(2, "City is required"),
  woreda: z.string().min(2, "Woreda is required"),
  deliveryAvailable: z.boolean(),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z
        .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
        .optional(),
    })
    .optional(),
});
