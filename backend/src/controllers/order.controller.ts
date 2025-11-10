// src/controllers/orderController.ts
import { Request, Response } from 'express';
import Order from '../models/order.js'
import Medicine from '../models/medicine.js';
import Pharmacy from '../models/pharmacy.js';
import { createNotification, notifyUserOrderStatus } from '../utils/notification.js';
import User from '../models/user.js';

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: userId missing' });
      return;
    }

    const {
      items,
      deliveryType,
      address,
      location,
      paymentMethod
    } = req.body;

    const prescriptionUrl = req.file ? `/uploads/prescriptions/${req.file.filename}` : null;

    // Validate and process order items
    const processedItems = [];
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      const pharmacy = await Pharmacy.findById(item.pharmacyId);

      if (!medicine || !pharmacy) {
         res.status(400).json({ error: 'Invalid medicine or pharmacy ID' });
         return
      }

      if (medicine.quantity < item.quantity) {
         res.status(400).json({ 
          error: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}` 
        });
        return
      }

      processedItems.push({
        medicine: medicine._id,
        pharmacy: pharmacy._id,
        quantity: item.quantity,
        price: medicine.price
      });

      // Update medicine stock
      medicine.quantity -= item.quantity;
      if (medicine.quantity === 0) {
        medicine.outOfStock = true;
      }
      await medicine.save();
    }

    const order = await Order.create({
      user: userId,
      items: processedItems,
      deliveryType,
      address,
      location,
      status: 'Placed',
      paymentMethod: paymentMethod || 'COD',
      prescriptionUrl,
    });

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name phone')
      .populate('items.medicine', 'name strength type')
      .populate('items.pharmacy', 'name address phone');

    res.status(201).json({
      message: 'Order placed successfully',
      order: populatedOrder,
    });

    // Send notification to user
    await createNotification({
      userId,
      message: 'Your order has been placed successfully.',
      type: 'in-app'
    });

    // Send notification to pharmacies
    const uniquePharmacies = [...new Set(items.map((item: any) => item.pharmacyId))];
    for (const pharmacyId of uniquePharmacies) {
      const pharmacy = await Pharmacy.findById(pharmacyId).populate('user');
      if (pharmacy && pharmacy.user) {
        await createNotification({
          userId: (pharmacy.user as any)._id.toString(),
          message: `New order received from ${(populatedOrder?.user as any)?.name}`,
          type: 'in-app'
        });
      }
    }

  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const orders = await Order.find({ user: userId })
      .populate('items.medicine', 'name strength type')
      .populate('items.pharmacy', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('items.medicine', 'name strength type')
      .populate('items.pharmacy', 'name address phone');

    if (!order) {
       res.status(404).json({ error: 'Order not found' });
       return
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) { 
      res.status(404).json({ error: 'Order not found' });
      return 
    }

    order.status = status;
    await order.save();

    const user = await User.findById(order.user);
    if (user?.phone) {
      await notifyUserOrderStatus(order._id.toString(), status, user.phone);
    }

    if (user?._id) {
      await createNotification({
        userId: user._id.toString(),
        message: `Your order status has been updated to "${status}".`,
        type: 'in-app'
      });
    }
    
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const getIncomingOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const pharmacy = await Pharmacy.findOne({ user: userId });

    if (!pharmacy) {
       res.status(404).json({ error: 'Pharmacy not found' });
       return
    }

    const orders = await Order.find({ 'items.pharmacy': pharmacy._id })
      .populate('user', 'name phone')
      .populate('items.medicine', 'name strength type')
      .populate('items.pharmacy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Fetching orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatuses = async (req: Request, res: Response) => {
  try {
    const { orderId, status, rejectionReason } = req.body;
    const userId = req.user?.userId;
    const pharmacy = await Pharmacy.findOne({ user: userId });

    if (!pharmacy) {
       res.status(404).json({ error: 'Pharmacy not found' });
       return
    }

    const order = await Order.findById(orderId);

    if (!order) {
       res.status(404).json({ error: 'Order not found' });
       return
    }

    const belongsToPharmacy = order.items.some((item) =>
      item.pharmacy.toString() === pharmacy._id.toString()
    );

    if (!belongsToPharmacy) {
       res.status(403).json({ error: 'Unauthorized access' });
       return
    }

    order.status = status;

    if (status === 'Cancelled' && rejectionReason) {
      order.notifications.push({
        type: 'Rejection',
        message: rejectionReason,
        sentAt: new Date(),
      });
    }

    await order.save();

    // Notify user
    const user = await User.findById(order.user);
    if (user) {
      await createNotification({
        userId: user._id.toString(),
        message: `Your order has been ${status.toLowerCase()}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        type: 'in-app'
      });

      if (user.phone) {
        await notifyUserOrderStatus(order._id.toString(), status, user.phone);
      }
    }

    res.status(200).json({ message: `Order ${status}`, order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const getSalesOverview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const pharmacy = await Pharmacy.findOne({ user: userId });

    if (!pharmacy) {
       res.status(404).json({ error: 'Pharmacy not found' });
       return
    }

    const allOrders = await Order.find({ 'items.pharmacy': pharmacy._id });

    const totalOrders = allOrders.length;
    const placed = allOrders.filter(order => order.status === 'Placed').length;
    const delivered = allOrders.filter(order => order.status === 'Delivered').length;
    const cancelled = allOrders.filter(order => order.status === 'Cancelled').length;

    res.status(200).json({
      totalOrders,
      placed,
      delivered,
      cancelled
    });
  } catch (error) {
    console.error('Error fetching sales overview:', error);
    res.status(500).json({ error: 'Failed to fetch sales overview' });
  }
};