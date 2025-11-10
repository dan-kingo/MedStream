// src/controllers/adminAuth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

import { Admin } from '../models/admin.js';
import User  from '../models/user.js';
import Pharmacy from '../models/pharmacy.js';
import Order  from '../models/order.js';
import { AdminMedicine } from '../models/adminMedicine.js';

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) 
        {
             res.status(401).json({ message: 'Invalid credentials' });
                return;
        }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) 
        {
             res.status(401).json({ message: 'Invalid credentials' });
                return;
        }

    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await User.find().select('-password');
  res.json(users);
};

export const getAllPharmacies = async (_req: Request, res: Response) => {
  const pharmacies = await Pharmacy.find();
  res.json(pharmacies);
}
// 2. Get pending pharmacy applications
export const getPendingPharmacies = async (_req: Request, res: Response) => {
  const pending = await Pharmacy.find({ status: 'pending' });
  res.json(pending);
};

// 3. Approve pharmacy
export const approvePharmacy = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Pharmacy.findByIdAndUpdate(id, { status: 'approved', isActive: true });
  res.json({ message: 'Pharmacy approved successfully' });
};

// 4. Reject pharmacy
export const rejectPharmacy = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Pharmacy.findByIdAndUpdate(id, { status: 'rejected', isActive: false });
  res.json({ message: 'Pharmacy rejected' });
};

// 5. Toggle active status
export const togglePharmacyActiveStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const pharmacy = await Pharmacy.findById(id);
  if (!pharmacy) 
    { res.status(404).json({ message: 'Pharmacy not found' });
      return;
    }

  pharmacy.isActive = !pharmacy.isActive;
  await pharmacy.save();
  res.json({ message: `Pharmacy ${pharmacy.isActive ? 'activated' : 'deactivated'}` });
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, pharmacyId, userId, status } = req.query;

    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (pharmacyId && mongoose.Types.ObjectId.isValid(pharmacyId as string)) {
      filters.pharmacy = pharmacyId;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId as string)) {
      filters.user = userId;
    }

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate as string);
      if (endDate) filters.createdAt.$lte = new Date(endDate as string);
    }

    const orders = await Order.find(filters)
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Failed to retrieve orders', error });
  }
};

export const createMedicine = async (req: Request, res: Response) => {
  try {
    const med = await AdminMedicine.create(req.body);
    res.status(201).json(med);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create medicine', error });
  }
};

export const getAllMedicines = async (_req: Request, res: Response) => {
  try {
    const meds = await AdminMedicine.find().sort({ name: 1 });
    res.json(meds);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medicines', error });
  }
};

export const updateMedicine = async (req: Request, res: Response) => {
  try {
    const med = await AdminMedicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!med) 
      {
         res.status(404).json({ message: 'Medicine not found' });
          return;   }

    res.json(med);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update medicine', error });
  }
};

export const deleteMedicine = async (req: Request, res: Response) => {
  try {
    const med = await AdminMedicine.findByIdAndDelete(req.params.id);
    if (!med) 
      {
         res.status(404).json({ message: 'Medicine not found' });
          return;   }
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete medicine', error });
  }
};


export const getBasicAnalytics = async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();
    const totalOrders = await Order.countDocuments();

    const mostRequestedMedicines = await Order.aggregate([
      { $unwind: '$items' }, // adjust if your order schema has a nested 'items' array
      {
        $group: {
          _id: '$items.medicine',
          totalOrdered: { $sum: '$items.quantity' },
        },
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicineDetails',
        },
      },
      { $unwind: '$medicineDetails' },
      {
        $project: {
          name: '$medicineDetails.name',
          totalOrdered: 1,
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      totalUsers,
      totalPharmacies,
      totalOrders,
      mostRequestedMedicines,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error });
  }
};


export const exportAnalyticsExcel = async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();
    const totalOrders = await Order.countDocuments();

    const mostRequestedMedicines = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          totalOrdered: { $sum: '$items.quantity' },
        },
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicineDetails',
        },
      },
      { $unwind: '$medicineDetails' },
      {
        $project: {
          name: '$medicineDetails.name',
          totalOrdered: 1,
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 10 },
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Analytics Report');

    sheet.addRow(['Metric', 'Value']);
    sheet.addRow(['Total Users', totalUsers]);
    sheet.addRow(['Total Pharmacies', totalPharmacies]);
    sheet.addRow(['Total Orders', totalOrders]);

    sheet.addRow([]);
    sheet.addRow(['Top 10 Most Requested Medicines']);
    sheet.addRow(['Medicine Name', 'Quantity Ordered']);

    mostRequestedMedicines.forEach((item) => {
      sheet.addRow([item.name, item.totalOrdered]);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to export Excel', error });
  }
};


export const exportAnalyticsPDF = async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();
    const totalOrders = await Order.countDocuments();

    const mostRequestedMedicines = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          totalOrdered: { $sum: '$items.quantity' },
        },
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicineDetails',
        },
      },
      { $unwind: '$medicineDetails' },
      {
        $project: {
          name: '$medicineDetails.name',
          totalOrdered: 1,
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 10 },
    ]);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('MediMap Analytics Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Total Users: ${totalUsers}`);
    doc.text(`Total Pharmacies: ${totalPharmacies}`);
    doc.text(`Total Orders: ${totalOrders}`);

    doc.moveDown().fontSize(14).text('Top 10 Most Requested Medicines');
    doc.fontSize(12);
    mostRequestedMedicines.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name} — ${item.totalOrdered} ordered`);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to export PDF', error });
  }
};
