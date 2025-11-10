// src/validations/auth.schema.ts
import { z } from 'zod';

export const requestOtpSchema = z.object({
  phone: z
    .string({
      required_error: 'Phone number is required',
      invalid_type_error: 'Phone number must be a string',
    })
    .regex(/^(\+251|0)?9\d{8}$/, 'Invalid Ethiopian phone number format'),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^(\+251|0)?9\d{8}$/, 'Invalid phone number'),
  otp: z
    .string()
    .length(6, { message: 'OTP must be exactly 6 digits' })
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

export const setPasswordSchema = z.object({
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must not exceed 64 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
});

export const loginWithPasswordSchema = z.object({
  phone: z
    .string()
    .regex(/^(\+251|0)?9\d{8}$/, 'Invalid phone number'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});


// Validation for forgotPasswordRequestOtp
export const forgotPasswordRequestOtpSchema = z.object({
  phone: z
    .string({
      required_error: 'Phone number is required',
      invalid_type_error: 'Phone number must be a string',
    })
    .regex(/^(\+251|0)?9\d{8}$/, 'Invalid Ethiopian phone number format'),
});

// Validation for verifyForgotPasswordOtp
export const verifyForgotPasswordOtpSchema = z.object({
  phone: z
    .string({
      required_error: 'Phone number is required',
      invalid_type_error: 'Phone number must be a string',
    })
    .regex(/^(\+251|0)?9\d{8}$/, 'Invalid Ethiopian phone number format'),
  
  otp: z
    .string({
      required_error: 'OTP is required',
      invalid_type_error: 'OTP must be a string',
    })
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});
