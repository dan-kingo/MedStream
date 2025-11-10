// src/routes/profileRoutes.ts
import express from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { addAddress, changePassword, deleteAddress, getProfile, updateAddress, updateProfile,getAddresses } from '../controllers/profile.controller.js';
import validate from '../middlewares/validationMiddleware.js';
import { addressSchema, changePasswordSchema, updateAddressSchema, updateProfileSchema } from '../validations/profile.schema.js';


const router = express.Router();

router.use(authenticateUser);

router.get('/',  getProfile);
router.get('/addresses', getAddresses);
router.put('/', validate(updateProfileSchema), updateProfile);
router.post('/address', validate(addressSchema), addAddress);
router.put('/address/:id',validate(updateAddressSchema), updateAddress);
router.delete('/address/:id', deleteAddress);
router.post(
  '/change-password',
  authenticateUser,
  validate(changePasswordSchema),
  changePassword
);


export default router;
