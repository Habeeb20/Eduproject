// controllers/virtualClassController.js
import asyncHandler from 'express-async-handler';
import VirtualClass from '../models/VirtualClass.js';

import User from '../models/User.js';

// 1. Create virtual class (teacher only)
export const createVirtualClass = asyncHandler(async (req, res) => {
  const teacher = req.user;
  if (teacher.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Only teachers can create virtual classes' });
  }

  const {
    title,
    link,
    dateTime,
    targetType,
    targetClasses,
    targetStudents,
  } = req.body;

  if (!title || !link || !dateTime || !targetType) {
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  }

  if (targetType === 'classes' && (!targetClasses || targetClasses.length === 0)) {
    return res.status(400).json({ success: false, message: 'Select at least one class' });
  }

  if (targetType === 'students' && (!targetStudents || targetStudents.length === 0)) {
    return res.status(400).json({ success: false, message: 'Select at least one student' });
  }

  const virtualClass = await VirtualClass.create({
    title,
    link,
    dateTime,
    teacher: teacher._id,
    schoolName: teacher.schoolName,
    targetType,
    targetClasses: targetType === 'classes' ? targetClasses : [],
    targetStudents: targetType === 'students' ? targetStudents : [],
  });

  res.status(201).json({ success: true, virtualClass });
});

// 2. Update status (teacher only)
export const updateVirtualClassStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const virtualClass = await VirtualClass.findById(id);
  if (!virtualClass) return res.status(404).json({ success: false, message: 'Virtual class not found' });

  if (virtualClass.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the creator can update status' });
  }

  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  virtualClass.status = status;
  virtualClass.history.push({
    status,
    changedBy: req.user._id,
    note: note || `Status changed to ${status}`,
  });

  await virtualClass.save();

  res.json({ success: true, virtualClass });
});

// 3. Get all virtual classes for current user (teacher or student)
export const getMyVirtualClasses = asyncHandler(async (req, res) => {
  const user = req.user;

  let query = { schoolName: user.schoolName };

  if (user.role === 'teacher') {
    query.teacher = user._id;
  } else if (user.role === 'student') {
    query.$or = [
      { targetType: 'students', targetStudents: user._id },
      { targetType: 'classes', targetClasses: user.class },
    ];
  } else {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const classes = await VirtualClass.find(query)
    .populate('teacher', 'name profilePicture')
    .populate('targetStudents', 'name')
    .sort({ dateTime: 1 });

  res.json({ success: true, classes });
});