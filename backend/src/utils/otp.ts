import twilio from 'twilio';
import User from '../models/user.js';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromPhone = process.env.TWILIO_PHONE_NUMBER!;
const client = twilio(accountSid, authToken);

interface SendOtpInput {
  phone: string;
  name?: string;
  email?: string;
  location?: string;
}

/**
 * Generate a 6-digit numeric OTP.
 */
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends an OTP to the provided phone number and stores it in the user document.
 */
export const sendOtpToUser = async ({phone,name,email,location}:SendOtpInput): Promise<void> => {
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  let user = await User.findOne({ phone });

  if (user?.password) {
    throw new Error('Password is already set. Please log in with password.');
  }

  if (!user) {
    user = await User.create({name,email,location, phone, otp, otpExpiresAt });
  } else {
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();
  }

  await client.messages.create({
    body: `Your MediMap OTP is: ${otp}`,
    from: fromPhone,
    to: phone,
  });
};

/**
 * Verifies the OTP and returns the user if valid.
 */
export const verifyUserOtp = async (phone: string, otp: string) => {
  const user = await User.findOne({ phone });

  if (!user || user.otp !== otp) {
    throw new Error('Invalid OTP');
  }

  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new Error('OTP expired');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  return user;
};

/**
 * Resends OTP to an existing user.
 */
export const resendOtpToUser = async (phone: string): Promise<void> => {
  const user = await User.findOne({ phone });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.password) {
    throw new Error('OTP login disabled. Please log in with password.');
  }


  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  await client.messages.create({
    body: `Your MediMap OTP is: ${otp}`,
    from: fromPhone,
    to: phone,
  });
};
