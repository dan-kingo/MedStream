// src/routes/pharmacyAuthRoutes.ts
import express from 'express';
import { loginPharmacy, registerPharmacy, setupPharmacyProfile } from '../controllers/pharmacy.auth.controller.js';
import validate from '../middlewares/validationMiddleware.js';
import { loginPharmacySchema, pharmacyProfileSchema, registerPharmacySchema } from '../validations/pharmacy.schema.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/update-profile', authenticateUser, validate(pharmacyProfileSchema),  setupPharmacyProfile)
router.post('/auth/register', validate(registerPharmacySchema), registerPharmacy);
router.post('/auth/login', validate(loginPharmacySchema), loginPharmacy);
export default router;
