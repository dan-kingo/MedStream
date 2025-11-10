// src/routes/adminAuth.routes.ts
import express from 'express';
import { adminLogin, approvePharmacy, createMedicine, deleteMedicine, exportAnalyticsExcel, exportAnalyticsPDF, getAllMedicines, getAllOrders, getAllPharmacies, getAllUsers, getBasicAnalytics, getPendingPharmacies, rejectPharmacy, togglePharmacyActiveStatus, updateMedicine } from '../controllers/admin.controller.js';
import { verifyAdmin } from '../middlewares/adminMiddleware.js';

const router = express.Router();
router.post('/login', adminLogin);

router.use(verifyAdmin);

router.get('/manage/users', getAllUsers);
router.get('/manage/pharmacies', getAllPharmacies);
router.get('/manage/analytics', getBasicAnalytics);
router.get('/manage/pharmacies/pending', getPendingPharmacies);
router.put('/manage/pharmacies/:id/approve', approvePharmacy);
router.put('/manage/pharmacies/:id/reject', rejectPharmacy);
router.put('/manage/pharmacies/:id/toggle', togglePharmacyActiveStatus);
router.get('/manage/orders', getAllOrders)
router.post('/manage/medicines', createMedicine);
router.get('/manage/medicines', getAllMedicines);
router.put('/manage/medicines/:id', updateMedicine);
router.delete('/manage/medicines/:id', deleteMedicine);
router.get('/manage/analytics/excel', exportAnalyticsExcel);
router.get('/manage/analytics/pdf', exportAnalyticsPDF);

export default router;
