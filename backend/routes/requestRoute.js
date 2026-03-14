// routes/requestRoutes.js
import express from "express"
import {protect, authorize} from "../middleware/auth.js"
import { getTemplatesByType, submitRequest, getAllPendingRequests, reviewRequest, getAllTemplates, createTemplate,
    updateTemplate, deleteTemplate
 } from "../controllers/requestController.js";
 import RequestSubmission from "../models/request/RequestSubmission.js";
const router = express.Router();



// Teacher routes
router.get('/request-templates', protect, getTemplatesByType);
router.post('/requests/submit', protect, submitRequest);

// Admin/Superadmin routes
router.get('/requests/pending', protect, authorize('admin', 'superadmin'), getAllPendingRequests);
router.put('/requests/:requestId/review', protect, authorize('admin', 'superadmin'), reviewRequest);


// routes/adminRoutes.js (or requestRoutes.js)
router.get('/request-templates', protect, authorize('admin', 'superadmin'), getAllTemplates);
router.post('/request-templates', protect, authorize('admin', 'superadmin'), createTemplate);
router.put('/request-templates/:id', protect, authorize('admin', 'superadmin'), updateTemplate);
router.delete('/request-templates/:id', protect, authorize('admin', 'superadmin'), deleteTemplate);


// routes/requestRoutes.js

// Teacher: Get my own requests
router.get('/requests/my', protect, async (req, res) => {
  const requests = await RequestSubmission.find({
    teacher: req.user._id,
    schoolName: req.user.schoolName,
  })
    .populate('template', 'title type')
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
});


router.get('/requests/all', protect, authorize('admin', 'superadmin'), async (req, res) => {
  const requests = await RequestSubmission.find({ schoolName: req.user.schoolName })
    .populate('teacher', 'name email')
    .populate('template', 'title type')
    .sort({ createdAt: -1 });
  res.json({ success: true, requests });
});

export default router;