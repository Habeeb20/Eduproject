// routes/userRoutes.js
import express from 'express';
import { getMyChildren } from '../controllers/parentController.js';

import { protect, authorize } from '../middleware/auth.js';

const parentRouter = express.Router();

// Only Super Admin can create Admin
parentRouter.post('/getmychildren', protect, authorize('parent'), getMyChildren);


export default parentRouter;