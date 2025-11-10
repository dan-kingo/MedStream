// src/validations/profile.schema.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long')
    .optional(),

  email: z
    .string()
    .email('Invalid email address')
    .optional(),

  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .optional(),

  language: z
    .enum(['en', 'am'], {
      errorMap: () => ({ message: 'Language must be either "en" or "am"' }),
    })
    .optional(),
});

export const addressSchema = z.object({
  label: z.string().min(2, 'Label must be at least 2 characters').optional(),
  street: z.string().min(2, 'Street must be at least 2 characters').optional(),
  city: z.string().min(2, 'City must be at least 2 characters').optional(),
  latitude: z
    .number({ invalid_type_error: 'Latitude must be a number' })
    .min(-90)
    .max(90)
    .optional(),
  longitude: z
    .number({ invalid_type_error: 'Longitude must be a number' })
    .min(-180)
    .max(180)
    .optional(),
});

export const updateAddressSchema = z.object({
  addressId: z
    .string({ required_error: 'Address ID is required' })
    .min(1, 'Address ID cannot be empty'),
  updates: addressSchema,
});

// src/validations/auth.schema.ts (updated)

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(64, 'New password too long')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
      .regex(/\d/, 'New password must contain at least one number')
      .regex(/[@$!%*?&]/, 'New password must contain at least one special character (@$!%*?&)'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm password does not match new password",
    path: ["confirmPassword"], // path of error
  });
