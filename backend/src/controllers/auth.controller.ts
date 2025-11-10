import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.js';
import { generateOtp, resendOtpToUser, sendOtpToUser, verifyUserOtp } from '../utils/otp.js';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromPhone = process.env.TWILIO_PHONE_NUMBER!;
const client = twilio(accountSid, authToken);

export const requestOtp = async (req: Request, res: Response) => {
  const { phone, name, email, location } = req.body;

  if (!phone) {
     res.status(400).json({ message: 'Phone is required' });
     return
  }


  try {

        const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser.isVerified) {
       res.status(409).json({ message: 'Phone number already registered' });
       return
    }

    await sendOtpToUser({ phone, name, email, location });
    res.status(200).json({ message: 'OTP sent' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to send OTP' });
  }
};

export const verifyOtpAndSetPassword = async (req: Request, res: Response) => {
  const { phone, otp, password } = req.body;
  
  try {
    // Verify OTP first
    const user = await verifyUserOtp(phone, otp);

    // If password is provided (registration flow), set it
    if (password) {
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    const token = generateToken(user._id.toString(), user.role);
    res.status(200).json({ 
      message: password ? 'Registration successful' : 'Login successful',
      token, 
      user 
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  const { phone} = req.body;
  if (!phone) 
    { res.status(400).json({ message: 'Phone is required' });
    return }

  try {
    await resendOtpToUser(phone);
    res.status(200).json({ message: 'OTP resent' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const setPassword = async (req: Request, res: Response) => {
  const { password } = req.body;

  

  if (!req.user || !req.user.userId) {
     res.status(401).json({ message: 'Unauthorized: user not authenticated' });
     return;
  }

  const user = await User.findById(req.user.userId);

  if (!user) {
     res.status(404).json({ message: 'User not found' });
     return
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  res.status(200).json({ message: 'Password set successfully' });
};


export const loginWithPassword = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });
  if (!user || !user.password) {
     res.status(400).json({ message: 'User not found or password not set' });
     return
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
     res.status(401).json({ message: 'Invalid credentials' });
     return
  }

  const token = generateToken(user._id.toString(), user.role);
  res.status(200).json({ message: 'Login successful', token, user });
};
export const logout = (_req: Request, res: Response) => {
  // Invalidate the token on the client side
  res.status(200).json({ message: 'Logged out successfully' });
};


export const forgotPasswordRequestOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
     res.status(404).json({ message: 'User not found' });
     return
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  await client.messages.create({
    body: `Your MediMap password reset OTP is: ${otp}`,
    from: fromPhone,
    to: phone,
  });

  res.status(200).json({ message: 'OTP sent for password reset' });
};

export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  const user = await User.findOne({ phone });

  if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
     res.status(400).json({ message: 'Invalid or expired OTP' });
     return
  }

  // Mark as eligible to reset password
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  // Issue a temporary token just for password reset
  const token = generateToken(user._id.toString(), user.role); // Or create a custom short-lived token

  res.status(200).json({ message: 'OTP verified. Proceed to reset password.', token });
};

export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  const { phone, otp, newPassword } = req.body;

  try {
    // 1. Find user and verify OTP
    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
       res.status(400).json({ message: 'Invalid or expired OTP' });
       return
    }

    // 2. Validate new password
    if (!newPassword || newPassword.length < 8) {
       res.status(400).json({ message: 'Password must be at least 8 characters' });
       return
    }

    // 3. Update password and clear OTP
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // 4. Return success (optionally include a token for auto-login)
    const token = generateToken(user._id.toString(), user.role);
    
     res.status(200).json({ 
      message: 'Password reset successfully',
      token, // Optional: if you want to auto-login the user
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Password reset error:', error);
     res.status(500).json({ message: 'Internal server error' });
  }
};