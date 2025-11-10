// routes/home.routes.ts
import express from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { getNearbyPharmacies } from '../controllers/home.controller.js';

const router = express.Router();

router.get('/', authenticateUser, getNearbyPharmacies);

export default router;
