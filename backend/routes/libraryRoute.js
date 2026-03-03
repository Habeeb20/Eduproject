
import express from "express"
import {uploadResource, getAllResources, deleteResource} from "../controllers/libraryController.js"
import { protect } from "../middleware/auth.js";
const router = express.Router()

router.post('/resources', protect, uploadResource);
router.get('/resources', protect, getAllResources);
// routes
router.delete('/resources/:id', protect, deleteResource);
export default router