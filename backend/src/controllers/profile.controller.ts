// src/controllers/profileController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js'
import Pharmacy from '../models/pharmacy.js';

export const getProfile = async (req: Request, res: Response) => {
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpiresAt');
    
    if (!user) 
        { res.status(404).json({ message: 'User not found' });
    return }

    // If user is a pharmacy, also fetch pharmacy data
    let pharmacy = null;
    if (user.role === 'pharmacy') {
      pharmacy = await Pharmacy.findOne({ user: user._id });
    }

    res.status(200).json({ user, pharmacy });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const { name, email, location, language } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) 
        { res.status(404).json({ message: 'User not found' });
    return }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (location !== undefined) user.location = location;
    if (language !== undefined) user.language = language;

    await user.save();
    res.status(200).json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const { label, street, city, latitude, longitude } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
         res.status(404).json({ message: 'User not found' })
            return }

    user.addresses.push({ label, street, city, latitude, longitude });
    await user.save();
    res.status(201).json({ message: 'Address added', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const { id } = req.params;
    const { label, street, city, latitude, longitude } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) 
        { res.status(404).json({ message: 'User not found' });
    return }

    const address = user.addresses.id(id);
    if (!address) { res.status(404).json({ message: 'Address not found' });
    return }

    address.label = label ?? address.label;
    address.street = street ?? address.street;
    address.city = city ?? address.city;
    address.latitude = latitude ?? address.latitude;
    address.longitude = longitude ?? address.longitude;

    await user.save();
    res.status(200).json({ message: 'Address updated', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const { id } = req.params;
    const user = await User.findById(req.user.userId);
    if (!user) 
        { res.status(404).json({ message: 'User not found' });
    return }

    const address = user.addresses.id(id);
    if (!address) { 
        res.status(404).json({ message: 'Address not found' });
    return }

    user.addresses.pull({ _id: id });
    await user.save();

    res.status(200).json({ message: 'Address deleted', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user?.userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) 
      { res.status(404).json({ message: 'User not found' });
    return }

    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
       res.status(400).json({ message: 'Current password is incorrect' });
       return
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAddresses = async (req:Request, res:Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('addresses');
    res.json({ addresses: user?.addresses || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};
