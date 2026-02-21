// controllers/groupController.js
import asyncHandler from 'express-async-handler';
import Group from '../models/group/Group.js';
import GroupMessage from '../models/group/GroupMessage.js';
import User from '../models/User.js';

import Notification from '../models/Notification.js';

// 1. Teacher creates group
export const createGroup = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.role !== 'teacher') return res.status(403).json({ success: false, message: 'Only teachers can create groups' });

  const { name, description, classNames, students } = req.body;

  if (!name?.trim() || (!classNames?.length && !students?.length)) {
    return res.status(400).json({ success: false, message: 'Name and participants required' });
  }

  let participants = [];

  // Add by class
  if (classNames?.length) {
    for (const className of classNames) {
      const classStudents = await User.find({ role: 'student', class: className, schoolName: user.schoolName }).select('_id');
      participants = [...participants, ...classStudents.map(s => s._id)];
    }
  }

  // Add individual students
  if (students?.length) {
    const selectedStudents = await User.find({ _id: { $in: students }, role: 'student', schoolName: user.schoolName }).select('_id');
    participants = [...participants, ...selectedStudents.map(s => s._id)];
  }

  const group = await Group.create({
    name: name.trim(),
    description: description?.trim(),
    createdBy: user._id,
    schoolName: user.schoolName,
    participants: [...new Set(participants)], // unique
    admins: [user._id],
    type: 'teacher_class',
  });

  // Notify participants
  for (const participantId of group.participants) {
    await Notification.create({
      user: participantId,
      type: 'group_join',
      title: `Joined Group: ${group.name}`,
      content: `You have been added to the group ${group.name} by ${user.name}.`,
      link: `/groups/${group._id}`,
      referenceId: group._id,
      schoolName: group.schoolName,
    });
  }

  res.status(201).json({ success: true, group });
});

// 2. Auto-add parent/teacher to school-wide group on creation
// (Call this in createUser controller for parent/teacher)
export const autoAddToSchoolGroup = async (newUser) => {
  let schoolGroup = await Group.findOne({ schoolName: newUser.schoolName, type: 'school_wide' });

  if (!schoolGroup) {
    schoolGroup = await Group.create({
      name: `${newUser.schoolName} School Group`,
      description: 'School-wide communication for parents and teachers',
      createdBy: newUser.createdBy, // admin/superadmin
      schoolName: newUser.schoolName,
      participants: [],
      admins: [newUser.createdBy],
      type: 'school_wide',
      isBlocked: false,
    });
  }

  schoolGroup.participants.push(newUser._id);
  await schoolGroup.save();

  // Notify
  await Notification.create({
    user: newUser._id,
    type: 'group_join',
    title: `Joined School Group: ${schoolGroup.name}`,
    content: 'You have been automatically added to the school-wide group.',
    link: `/groups/${schoolGroup._id}`,
    referenceId: schoolGroup._id,
    schoolName: newUser.schoolName,
  });
};



// 3. Send message to group
export const sendGroupMessage = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' });

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  if (group.isBlocked && !group.admins.includes(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Group is blocked. Only admins can send messages' });
  }

  if (!group.participants.includes(req.user._id) && !group.admins.includes(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Not a member of this group' });
  }

  const message = await GroupMessage.create({
    sender: req.user._id,
    group: groupId,
    content: content.trim(),
    schoolName: group.schoolName,
  });

  // Notify group participants (except sender)
  const notifyUsers = group.participants.filter(p => p.toString() !== req.user._id.toString());
  for (const userId of notifyUsers) {
    await Notification.create({
      user: userId,
      type: 'group_message',
      title: `New Message in Group: ${group.name}`,
      content: `From ${req.user.name}: ${content.slice(0, 100)}...`,
      link: `/groups/${group._id}`,
      referenceId: message._id,
      schoolName: group.schoolName,
    });
  }

  res.status(201).json({ success: true, message });
});

// 4. Get group messages
export const getGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId).populate('participants', 'name role profilePicture') // ← populate here too if needed
    .lean();;
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  if (!group.participants.includes(req.user._id) && !group.admins.includes(req.user._id) && group.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not a member' });
  }

  const messages = await GroupMessage.find({ group: groupId })
    .populate('sender', 'name profilePicture role')
    .sort({ createdAt: 1 })
    .lean();

  res.json({ success: true, messages });
});

// 5. Admin/superadmin remove participant
export const removeParticipant = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  if (!['admin', 'superadmin'].includes(req.user.role) && !group.admins.includes(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  group.participants = group.participants.filter(p => p.toString() !== userId);
  await group.save();

  // Notify removed user
  await Notification.create({
    user: userId,
    type: 'group_remove',
    title: `Removed from Group: ${group.name}`,
    content: `You have been removed from the group by an admin.`,
    schoolName: group.schoolName,
  });

  res.json({ success: true });
});

// 6. Block/unblock group
export const toggleBlockGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { isBlocked } = req.body;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  if (!['admin', 'superadmin'].includes(req.user.role) && !group.admins.includes(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  group.isBlocked = isBlocked;
  await group.save();

  // Notify participants
  const notifyType = isBlocked ? 'group_blocked' : 'group_unblocked';
  const notifyTitle = isBlocked ? `Group Blocked: ${group.name}` : `Group Unblocked: ${group.name}`;
  const notifyContent = isBlocked ? 'The group is now blocked. Only admins can send messages.' : 'The group is unblocked. Everyone can send messages.';

  for (const participantId of group.participants) {
    await Notification.create({
      user: participantId,
      type: notifyType,
      title: notifyTitle,
      content: notifyContent,
      referenceId: group._id,
      schoolName: group.schoolName,
    });
  }

  res.json({ success: true, group });
});


// controllers/groupController.js
// ... (keep previous methods)

// 7. Admin/Superadmin creates school-wide group (auto-adds all teachers & parents)
export const createSchoolWideGroup = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!['admin', 'superadmin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Only admin/superadmin can create school-wide group' });
  }

  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ success: false, message: 'Group name required' });
  }

  // Auto-add all teachers, parents, admins/superadmins in the school
  const participants = await User.find({
    schoolName: user.schoolName,
    role: { $in: ['teacher', 'parent', 'admin', 'superadmin'] },
  }).select('_id');

  const group = await Group.create({
    name: name.trim(),
    description: description?.trim(),
    createdBy: user._id,
    schoolName: user.schoolName,
    participants: participants.map(p => p._id),
    admins: [user._id],
    type: 'school_wide',
    isBlocked: false,
  });

  // Notify all participants
  for (const participantId of group.participants) {
    await Notification.create({
      user: participantId,
      type: 'group_join',
      title: `Joined School-Wide Group: ${group.name}`,
      content: `The school has created a school-wide group. You are now a member.`,
      link: `/groups/${group._id}`,
      referenceId: group._id,
      schoolName: group.schoolName,
    });
  }

  res.status(201).json({ success: true, group });
});
// controllers/groupController.js
export const getMyGroups = asyncHandler(async (req, res) => {
  const user = req.user;

  const groups = await Group.find({
    $or: [
      { participants: user._id },
      { admins: user._id },
    ],
    schoolName: user.schoolName,
  })
    .populate('createdBy', 'name profilePicture role')           // Optional: populate creator
    .populate('participants', 'name role profilePicture email class') // ← THIS IS THE FIX!
    .populate('admins', 'name profilePicture role')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    groups,
  });
});

// New method
export const getGroupDetails = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const user = req.user;

  const group = await Group.findById(groupId)
    .populate('createdBy', 'name profilePicture role')
    .populate('participants', 'name role profilePicture email class studentId')
    .populate('admins', 'name profilePicture role')
    .lean();

  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  // Optional: check membership
  if (!group.participants.some(p => p._id.toString() === user._id.toString()) &&
      !group.admins.some(a => a._id.toString() === user._id.toString())) {
    return res.status(403).json({ success: false, message: 'Not a member of this group' });
  }

  res.json({ success: true, group });
});