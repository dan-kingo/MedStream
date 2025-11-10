// src/controllers/pharmacyAuthController.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";

import User from "../models/user.js";
import Pharmacy from "../models/pharmacy.js";
import { generateToken } from "../utils/jwt.js";

export const registerPharmacy = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: "Pharmacy already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "pharmacy",
    });

    const newPharmacy = await Pharmacy.create({
      name,
      email,
      phone,
      user: newUser._id,
      // address, city, location, deliveryAvailable will be added later
    });

    const token = generateToken(newUser._id.toString(), newUser.role);

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      pharmacy: newPharmacy,
    });
  } catch (error) {
    console.error("Pharmacy registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const loginPharmacy = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const pharmacy = await Pharmacy.findOne({ email });
    if (!pharmacy) {
      res.status(404).json({ error: "Pharmacy not found" });
      return;
    }

    const user = await User.findOne({ email, role: "pharmacy" });
    if (!user) {
      res.status(404).json({ error: "Pharmacy not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      pharmacy: pharmacy,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const setupPharmacyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      name,
      ownerName,
      licenseNumber,
      phone,
      email,
      address,
      city,
      woreda,
      location,
      deliveryAvailable,
    } = req.body;

    const pharmacy = await Pharmacy.findOneAndUpdate(
      { user: userId },
      {
        name,
        ownerName,
        licenseNumber,
        phone,
        email,
        address,
        city,
        woreda,
        location,
        deliveryAvailable,
      },
      { new: true }
    );

    if (!pharmacy) {
      res.status(404).json({ message: "Pharmacy not found for this user." });
      return;
    }

    res.status(200).json({ message: "Pharmacy profile updated", pharmacy });
  } catch (error) {
    console.error("Pharmacy profile setup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};