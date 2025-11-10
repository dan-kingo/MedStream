import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Admin } from '../models/admin.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_LOCAL_URI!);

  const email = 'admin123@gmail.com';
  const existing = await Admin.findOne({ email });

  if (existing) {
    console.log('⚠️ Admin already exists');
    return process.exit();
  }

  const hashedPassword = await bcrypt.hash('admin@11', 10);
  await Admin.create({ email, password: hashedPassword });

  console.log('✅ Admin created');
  process.exit();
};

seed();
