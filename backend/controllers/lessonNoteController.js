// controllers/lessonNoteController.js
import asyncHandler from 'express-async-handler';
import LessonNote from "../models/lessonNote.js"


// 1. Teacher creates lesson note (sends Cloudinary URL)
export const createLessonNote = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Only teachers can upload lesson notes' });
  }

  const { title, subject, className, term, week, fileUrl, filePublicId } = req.body;

  if (!title?.trim() || !subject?.trim() || !className?.trim() || !term || !week || !fileUrl) {
    return res.status(400).json({ success: false, message: 'All fields and file URL are required' });
  }

  const note = await LessonNote.create({
    title: title.trim(),
    subject: subject.trim(),
    className: className.trim(),
    term,
    week: Number(week),
    teacher: req.user._id,
    schoolName: req.user.schoolName,
    fileUrl,
    filePublicId,
  });

  res.status(201).json({
    success: true,
    message: 'Lesson note uploaded successfully. Awaiting approval',
    lessonNote: note,
  });
});

// 2. Admin/Superadmin: Get all lesson notes (with filters)
export const getAllLessonNotes = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { status, className, subject, term } = req.query;

  const query = { schoolName: req.user.schoolName };

  if (status) query.status = status;
  if (className?.trim()) query.className = className.trim();
  if (subject?.trim()) query.subject = subject.trim();
  if (term) query.term = term.trim();

  const notes = await LessonNote.find(query)
    .populate('teacher', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    count: notes.length,
    lessonNotes: notes,
  });
});

// 3. Admin/Superadmin: Approve or reject
export const reviewLessonNote = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { status, feedback } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
  }

  const note = await LessonNote.findOne({
    _id: id,
    schoolName: req.user.schoolName,
  });

  if (!note) {
    return res.status(404).json({ success: false, message: 'Lesson note not found' });
  }

  if (note.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Note already reviewed' });
  }

  note.status = status;
  note.feedback = feedback?.trim() || undefined;
  note.approvedBy = req.user._id;
  note.approvedAt = new Date();

  await note.save();

  res.json({
    success: true,
    message: `Lesson note ${status}`,
    lessonNote: note,
  });
});

// 4. Teacher: Get their own lesson notes
export const getMyLessonNotes = asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Only teachers can view their notes' });
  }

  const notes = await LessonNote.find({
    teacher: req.user._id,
    schoolName: req.user.schoolName,
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    count: notes.length,
    lessonNotes: notes,
  });
});