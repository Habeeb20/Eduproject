import LibraryResource from "../models/Library.js"
import asyncHandler from "express-async-handler"
import cloudinary from 'cloudinary'; 


export const getAllResources = asyncHandler(async (req, res) => {
  const user = req.user;
  const resources = await LibraryResource.find({ schoolName: user.schoolName })
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, resources });
});



// controllers/libraryController.js
export const deleteResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!['superadmin', 'admin', 'teacher', 'librarian'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const resource = await LibraryResource.findById(id);
  if (!resource) return res.status(404).json({ success: false, message: 'Not found' });
  if (resource.schoolName !== user.schoolName) return res.status(403).json({ success: false, message: 'Unauthorized' });

  await resource.deleteOne();

  res.json({ success: true, message: 'Resource deleted' });
});

























export const uploadResource = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!['superadmin', 'admin', 'teacher', 'librarian'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { title, author, subject, classLevel, fileType, fileUrl } = req.body;

  if (!title || !subject || !classLevel || !fileType || !fileUrl) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  let thumbnailUrl = null;

  if (fileType === 'pdf') {
    // Generate thumbnail from first page of PDF using Cloudinary transformation
    const publicId = fileUrl.split('/').pop().split('.')[0]; // extract public_id from url
    thumbnailUrl = cloudinary.url(publicId, {
      resource_type: 'image',
      format: 'jpg',
      transformation: [
        { page: 1 },           // first page
        { width: 300, height: 400, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
  } else if (fileType === 'video') {
    // For video: use Cloudinary's auto-generated poster (first frame)
    const publicId = fileUrl.split('/').pop().split('.')[0];
    thumbnailUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width: 300, height: 200, crop: 'fill' },
        { quality: 'auto' }
      ]
    });
  }

  const resource = await LibraryResource.create({
    title,
    author,
    subject,
    classLevel,
    fileType,
    fileUrl,
    thumbnailUrl,          // ← new field
    uploadedBy: user._id,
    schoolName: user.schoolName,
  });

  res.status(201).json({ success: true, resource });
});