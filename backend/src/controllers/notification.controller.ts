// src/controllers/notificationController.ts
import Notification from '../models/notification.js';
import { Request, Response } from 'express';

export const getMyNotifications = async (req:Request, res:Response) => {
  try {
    const userId = req.user?.userId;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req:Request, res:Response) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
       res.status(404).json({ error: 'Notification not found' });
       return
    }

    res.status(200).json({ message: 'Marked as read', notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

export const getUnreadCount = async (req:Request, res:Response) => {
  try {
    const userId = req.user?.userId;
    const count = await Notification.countDocuments({ user: userId, isRead: false });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch count' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
       res.status(401).json({ error: 'Unauthorized' });
       return
    }

    await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};