// routes/medicine.routes.ts
import express from 'express';
import { addMedicine, deleteMedicine, getMedicineDetails, getMedicines, getMedicinesByPharmacy, getPopularMedicines, markOutOfStock, searchMedicines, updateMedicine } from '../controllers/medicine.controller.js';
import validate from '../middlewares/validationMiddleware.js';
import { medicineDetailsParamsSchema, medicineSchema } from '../validations/medicine.schema.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/search', searchMedicines);
router.get('/popular', getPopularMedicines);
router.get('/:pharmacyId', authenticateUser, getMedicinesByPharmacy);
router.get('/:id', validate(medicineDetailsParamsSchema), getMedicineDetails); // Assuming this is for getting details of a specific medicine
router.get('/', authenticateUser, getMedicines);
router.post('/', authenticateUser, validate(medicineSchema), addMedicine);
router.put('/:id', authenticateUser, updateMedicine);
router.delete('/:id', authenticateUser, deleteMedicine);
router.patch('/:id/out-of-stock', authenticateUser, markOutOfStock);
export default router;
