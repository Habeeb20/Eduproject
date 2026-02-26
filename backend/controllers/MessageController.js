import asyncHandler from 'express-async-handler';

import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// 1. Get teachers/admins for a school (for frontend selection)
export const getSchoolRecipients = asyncHandler(async (req, res) => {
  const user = req.user;
  let schoolName;

  if (user.role === 'parent') {
    // Parents get school from their child's profile (assume user has child field)
    const child = await User.findById(user.child || user.children); // Adjust if child is array
    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });
    schoolName = child.schoolName;
  } else if (user.role === 'student' || ['teacher', 'admin', 'superadmin'].includes(user.role)) {
    schoolName = user.schoolName;
  } else {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  // Fetch teachers and admins/superadmins in the school
  const teachers = await User.find({
    role: 'teacher',
    schoolName,
  }).select('name _id email profilePicture');

  const admins = await User.find({
    role: { $in: ['admin', 'superadmin'] },
    schoolName,
  }).select('name _id email profilePicture');

  res.json({
    success: true,
    teachers,
    admins,
  });
});

// export const sendMessage = asyncHandler(async (req, res) => {
//   const user = req.user;
//   const { recipients, subject, content, threadId } = req.body; // Add threadId for replies

// //   if (!recipients?.length || !content?.trim()) {
// //     return res.status(400).json({ success: false, message: 'Recipients and content are required' });
// //   }

//   let schoolName;

//   if (user.role === 'parent') {
//     const child = await User.findOne({ _id: { $in: user.children } }); // Take first child or adjust
//     if (!child) return res.status(404).json({ success: false, message: 'Child not found' });
//     schoolName = child.schoolName;
//   } else if (user.role === 'student') {
//     schoolName = user.schoolName;
//   } else if (['teacher', 'admin', 'superadmin'].includes(user.role)) {
//     schoolName = user.schoolName;
//   } else {
//     return res.status(403).json({ success: false, message: 'Unauthorized' });
//   }

//   // Validate recipients (role-based)
//   const validRoles = ['teacher', 'admin', 'superadmin', 'student', 'parent'];
//   const validRecipients = await User.find({
//     _id: { $in: recipients },
//     role: { $in: validRoles },
//     schoolName,
//   });

//   if (validRecipients.length !== recipients.length) {
//     return res.status(400).json({ success: false, message: 'Invalid recipients' });
//   }

//   const message = await Message.create({
//     sender: user._id,
//     recipients,
//     subject: subject?.trim(),
//     content: content.trim(),
//     threadId, // For replies
//     schoolName,
//   });

//   // Send notifications to recipients
//   for (const recipientId of recipients) {
//     await Notification.create({
//       user: recipientId,
//       type: threadId ? 'reply' : 'new_message',
//       title: threadId ? 'New Reply in Conversation' : 'New Message',
//       content: `From ${user.name}: ${content.slice(0, 100)}...`,
//       link: `/messages/thread/${threadId || message._id}`,
//       referenceId: message._id,
//       schoolName,
//     });
//   }

//   res.status(201).json({
//     success: true,
//     message: 'Message sent successfully',
//     data: message,
//   });
// });

// 3. Get conversations (threaded)

export const sendMessage = asyncHandler(async (req, res) => {
  const user = req.user;
  const { recipients, subject, content, threadId } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }

  let schoolName;

  if (user.role === 'parent') {
    const child = await User.findOne({ _id: { $in: user.children } });
    if (!child) return res.status(404).json({ success: false, message: 'Child not found' });
    schoolName = child.schoolName;
  } else if (user.role === 'student') {
    schoolName = user.schoolName;
  } else if (['teacher', 'admin', 'superadmin'].includes(user.role)) {
    schoolName = user.schoolName;
  } else {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  let finalRecipients = recipients || [];

  // If this is a reply (threadId exists), include ALL original participants
  if (threadId) {
    const originalMessage = await Message.findById(threadId);
    if (!originalMessage) {
      return res.status(404).json({ success: false, message: 'Original message not found' });
    }

    // Combine: original sender + original recipients + current user (if not already included)
    const threadParticipants = [
      originalMessage.sender.toString(),
      ...originalMessage.recipients.map(r => r.toString()),
    ];

    finalRecipients = [
      ...new Set([
        ...threadParticipants,
        ...finalRecipients.map(r => r.toString()), // any extra selected
        user._id.toString(), // current replier
      ]),
    ].filter(id => id !== user._id.toString()); // optional: don't send to self
  } else {
    // New message: validate selected recipients
    const validRecipients = await User.find({
      _id: { $in: finalRecipients },
      role: { $in: ['teacher', 'admin', 'superadmin', 'student', 'parent'] },
      schoolName,
    });

    if (validRecipients.length !== finalRecipients.length) {
      return res.status(400).json({ success: false, message: 'Invalid recipients' });
    }
  }

  const message = await Message.create({
    sender: user._id,
    recipients: finalRecipients,
    subject: subject?.trim() || 'No Subject',
    content: content.trim(),
    threadId,
    schoolName,
  });

  // Create notifications for all recipients (except sender)
  for (const recipientId of finalRecipients) {
    if (recipientId.toString() === user._id.toString()) continue; // don't notify self

    await Notification.create({
      user: recipientId,
      type: threadId ? 'reply' : 'new_message',
      title: threadId ? 'New Reply in Conversation' : 'New Message Received',
      content: `From ${user.name}: ${content.slice(0, 100)}...`,
      link: `/messages/thread/${threadId || message._id}`,
      referenceId: message._id,
      schoolName,
    });
  }

  res.status(201).json({
    success: true,
    message: threadId ? 'Reply sent' : 'Message sent',
    data: message,
  });
});

export const getConversations = asyncHandler(async (req, res) => {
  const user = req.user;

  const messages = await Message.find({
    $or: [{ sender: user._id }, { recipients: user._id }],
    schoolName: user.schoolName,
  })
    .populate({
      path: 'sender',
      select: 'name role profilePicture email phone studentId class schoolName children',
      populate: {
        path: 'children',
        select: 'name class rollNumber studentId profilePicture',
      },
    })
    .populate('recipients', 'name role profilePicture email phone')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    messages,
  });
});

// 4. Mark message as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await Message.findById(id);

  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

  if (!message.recipients.some(r => r.toString() === req.user._id.toString())) {
    return res.status(403).json({ success: false, message: 'Not a recipient' });
  }

  if (!message.readBy.includes(req.user._id)) {
    message.readBy.push(req.user._id);
    message.status = 'read';
    await message.save();
  }

  res.json({ success: true, message });
});