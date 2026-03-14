import asyncHandler from "express-async-handler"
import RequestSubmission from "../models/request/RequestSubmission.js";
import RequestTemplate from "../models/request/RequestTemplate.js";
import { DEFAULT_LETTER_BODIES } from "../utils/seedTemplate.js";
// 1. Get templates by type (teacher sees only active ones)
export const getTemplatesByType = asyncHandler(async (req, res) => {
  const { type } = req.query;
  try {
 const { type } = req.query;

  const query = { isActive: true, schoolName: req.user.schoolName };

  if (type) {
    const types = type.split(',').map(t => t.trim());
    query.type = { $in: types }; // MongoDB $in operator for multiple values
  }

  const templates = await RequestTemplate.find(query).sort({ type: 1, title: 1 });

  res.json({ success: true, templates });
  } catch (error) {
    console.log(error)
    res.status(500).json({message: "unable to get data from the server"})
  }
 
});

// 2. Submit new request (unified endpoint)
export const submitRequest = asyncHandler(async (req, res) => {
  const teacher = req.user;
  const {
    templateId,
    type,
    subject,
    body,
    startDate,
    endDate,
    lastWorkingDay,
    isAnonymous,
  } = req.body;

  if (!['leave', 'resignation', 'report'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid request type' });
  }

  const template = await RequestTemplate.findOne({
    _id: templateId,
    type,
    isActive: true,
    schoolName: teacher.schoolName,
  });

  if (!template) {
    return res.status(404).json({ success: false, message: 'Template not found or inactive' });
  }

  const submission = await RequestSubmission.create({
    teacher: teacher._id,
    template: templateId,
    type,
    subject: subject.trim(),
    body: body.trim(),
    startDate: type === 'leave' ? startDate : undefined,
    endDate: type === 'leave' ? endDate : undefined,
    lastWorkingDay: type === 'resignation' ? lastWorkingDay : undefined,
    isAnonymous: type === 'report' ? isAnonymous : undefined,
    schoolName: teacher.schoolName,
  });

  res.status(201).json({
    success: true,
    message: `${type.charAt(0).toUpperCase() + type.slice(1)} request submitted successfully`,
    submission,
  });
});

// 3. Admin/Superadmin: Get all pending requests (paginated)
export const getAllPendingRequests = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { page = 1, limit = 20, type, status = 'pending' } = req.query;

  const query = {
    status,
    schoolName: user.schoolName,
  };
  if (type) query.type = type;

  const requests = await RequestSubmission.find(query)
    .populate('teacher', 'name email')
    .populate('template', 'title type')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await RequestSubmission.countDocuments(query);

  res.json({
    success: true,
    requests,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// 4. Admin/Superadmin: Review / Action on request
export const reviewRequest = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { requestId } = req.params;
  const { status, reviewComment } = req.body;

  const request = await RequestSubmission.findById(requestId);
  if (!request || request.schoolName !== user.schoolName) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  if (!['approved', 'declined', 'acknowledged', 'reviewed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  request.status = status;
  request.reviewedBy = user._id;
  request.reviewComment = reviewComment || undefined;

  await request.save();

  res.json({
    success: true,
    message: `Request ${status}`,
    request,
  });
});




export const getAllTemplates = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = { schoolName: req.user.schoolName };
  if (type) query.type = type;

  const templates = await RequestTemplate.find(query).sort({ type: 1, title: 1 });
  res.json({ success: true, templates });
});

export const createTemplate = asyncHandler(async (req, res) => {
  const user = req.user;
  const { type, title, category, bodyKey } = req.body;

  if (!['leave', 'resignation', 'report'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid template type' });
  }

    if (!DEFAULT_LETTER_BODIES[type] || !DEFAULT_LETTER_BODIES[type][bodyKey]) {
    return res.status(400).json({ success: false, message: 'Invalid body template key' });
  }

  const content = DEFAULT_LETTER_BODIES[type][bodyKey];

  const template = await RequestTemplate.create({
    type,
    title,
    category,
    content,
    createdBy: user._id,
    schoolName: user.schoolName,
  });

  res.status(201).json({ success: true, template });
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const template = await RequestTemplate.findOneAndUpdate(
    { _id: id, schoolName: req.user.schoolName },
    updates,
    { new: true, runValidators: true }
  );

  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

  res.json({ success: true, template });
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const template = await RequestTemplate.findOneAndDelete({
    _id: id,
    schoolName: req.user.schoolName,
  });

  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

  res.json({ success: true, message: 'Template deleted' });
});








