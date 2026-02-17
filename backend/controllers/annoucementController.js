// controllers/announcementController.js
import asyncHandler from 'express-async-handler';
import Announcement from '../models/announcement.js';
import User from '../models/User.js';

// 1. Create announcement (superadmin / admin only)
export const createAnnouncement = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only superadmin or admin can post announcements' });
  }

  const { title, content, targetAudience, expiresAt } = req.body;

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  if (!['teachers_staff', 'students', 'all'].includes(targetAudience)) {
    return res.status(400).json({ success: false, message: 'Invalid target audience' });
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    content: content.trim(),
    targetAudience,
    postedBy: req.user._id,
    schoolName: req.user.schoolName,           // ← Critical: add this!
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  res.status(201).json({
    success: true,
    message: 'Announcement posted successfully',
    announcement,
  });
});

// 2. Get announcements visible to the current user
export const getMyAnnouncements = asyncHandler(async (req, res) => {
  const user = req.user;

  // Build query
  const query = {
    schoolName: user.schoolName,                // ← Critical security filter!
    isActive: true,
    $or: [
      { expiresAt: { $gte: new Date() } },     // still valid
      { expiresAt: null },                     // no expiry
    ],
  };

  // Audience filtering based on user role
  if (user.role === 'student') {
    query.targetAudience = { $in: ['students', 'all'] };
  } else if (['teacher', 'accountant', 'librarian'].includes(user.role)) {
    query.targetAudience = { $in: ['teachers_staff', 'all'] };
  }
  // superadmin & admin see everything → no extra filter

  const announcements = await Announcement.find(query)
    .populate('postedBy', 'name  role profilePicture')
  .sort({  createdAt: -1 }) // pinned first
  .limit(50)
  .lean();


  res.json({
    success: true,
    count: announcements.length,
    announcements,
  });
});

// 3. Delete announcement (only creator or superadmin/admin)
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  // Only superadmin, admin, or the person who posted it can delete
  if (
    !['superadmin', 'admin'].includes(req.user.role) &&
    announcement.postedBy.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this announcement' });
  }

  // Also check school match (extra safety)
  if (announcement.schoolName !== req.user.schoolName) {
    return res.status(403).json({ success: false, message: 'Not authorized for this school' });
  }

  await Announcement.findByIdAndDelete(id);

  res.json({ success: true, message: 'Announcement deleted successfully' });
});

// 4. Toggle active status (archive/unarchive)
export const toggleAnnouncementStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ success: false, message: 'isActive must be boolean' });
  }

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Only superadmin/admin can toggle status' });
  }

  if (announcement.schoolName !== req.user.schoolName) {
    return res.status(403).json({ success: false, message: 'Not authorized for this school' });
  }

  announcement.isActive = isActive;
  await announcement.save();

  res.json({
    success: true,
    message: `Announcement ${isActive ? 'activated' : 'archived'}`,
    announcement,
  });
});