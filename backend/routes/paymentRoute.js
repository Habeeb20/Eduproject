// routes/paymentRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { initializePayment, paystackWebhook, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

// Initialize payment (superadmin only)
router.post('/initialize', protect, authorize('superadmin'), initializePayment);

// Verify after redirect (frontend calls this)
router.get('/verify/:reference',   verifyPayment);

// Paystack webhook (no auth – Paystack calls this)
router.post('/webhook', paystackWebhook);

export default router;