// src/routes/notificationRoutes.ts
import express from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { getMyNotifications, getUnreadCount, markAllAsRead, markAsRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/unread/count', authenticateUser, getUnreadCount);
router.get('/', authenticateUser, getMyNotifications);
router.get('/all', authenticateUser, markAllAsRead); // Assuming this is for all notifications
router.patch('/:id/read', authenticateUser, markAsRead);

export default router;
