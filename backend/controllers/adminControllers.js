
// controllers/adminController.js
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { generateDigitalId } from '../utils/generateDigitalId.js';
import Class from '../models/class/classModel.js';
import { autoAddToSchoolGroup } from './groupController.js';
// ──────────────────────────────────────────────
// 1. Superadmin creates school admin
// ──────────────────────────────────────────────
export const createSchoolAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only superadmin can create school admin' });
  }

  const { name, email, password, phone, schoolName } = req.body;

  const plainPassword = password || 'admin123'; // Default if not provided
  const hashed = await bcrypt.hash(plainPassword, 10);

  const existingAdmin = await User.findOne({ role: 'admin', schoolName });
  if (existingAdmin) {
    return res.status(400).json({ success: false, message: 'School already has an admin' });
  }

  const admin = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    tempPlainPassword: plainPassword,
    phone,
    role: 'admin',
    schoolName,
    createdBy: req.user._id,
  });
    const digitalId = await generateDigitalId(admin);

  res.status(201).json({
    success: true,
    message: 'School admin created',
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      schoolName: admin.schoolName,
      digitalId,
      temporaryPassword: plainPassword, // Superadmin sees it
    },
  });
});

// ──────────────────────────────────────────────
// 2. Admin / Superadmin creates teacher
// ──────────────────────────────────────────────
export const createTeacher = asyncHandler(async (req, res) => {
  console.log(req.user)
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { name, email, password, phone, subjects } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const plainPassword = password || 'teacher123';
  const hashed = await bcrypt.hash(plainPassword, 10);

  const teacherCount = await User.countDocuments({ role: 'teacher', schoolName: req.user.schoolName });
  const teacherId = `TCH-${String(teacherCount + 1).padStart(4, '0')}`;

  const teacher = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    tempPlainPassword: plainPassword,
    phone,
    role: 'teacher',
    teacherId,
    subjects: subjects || [],
    schoolName: req.user.schoolName,
    createdBy: req.user._id,
  });
  const digitalId = await generateDigitalId(teacher);

  if (teacher.role === 'parent' || teacher.role === 'teacher') {
  await autoAddToSchoolGroup(teacher);
}
  res.status(201).json({
    success: true,
    message: 'Teacher created',
    teacher: {
      _id: teacher._id,
      teacherId: teacher.teacherId,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subjects: teacher.subjects,
      schoolName: teacher.schoolName,
      digitalId,
      temporaryPassword: req.user.role === 'superadmin' ? plainPassword : undefined,
    },
  });
});

// ──────────────────────────────────────────────
// 3. Admin / Superadmin creates student + parent
// ──────────────────────────────────────────────


export const createStudentWithParent = asyncHandler(async (req, res) => {

  try {
    

  // Only admin or superadmin can create students
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const {
    studentName,
    studentEmail,
    studentClass,
    rollNumberPrefix, // optional from frontend (ignored - we generate it)
    parentName,
    parentEmail,
    parentPhone,
    password, // ← now required from frontend
  } = req.body;

  // Validate required fields
  if (!studentName || !studentClass || !parentName || !parentEmail || !parentPhone || !password) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided' });
  }

  // Check for duplicate emails
  if (studentEmail && (await User.findOne({ email: studentEmail.toLowerCase() }))) {
    return res.status(400).json({ success: false, message: 'Student email already exists' });
  }
  if (await User.findOne({ email: parentEmail.toLowerCase() })) {
    return res.status(400).json({ success: false, message: 'Parent email already exists' });
  }


  const schoolName = req.user.schoolName || 'Unknown School';
  const prefix = schoolName.substring(0, 2).toUpperCase(); // e.g., "LA" from "Lagos..."

  // Count existing students in this school to get next number
  const studentCount = await User.countDocuments({
    role: 'student',
    schoolName: req.user.schoolName,
  });

  const nextNumber = String(studentCount + 1).padStart(2, '0'); // 01, 02, ..., 10, 11...
  const studentRollNumber = `${prefix}${nextNumber}`; // e.g., LA01, LA02


    const classDoc = await Class.findOne({
      name: studentClass,
      schoolName: req.user.schoolName,
    });

    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: `Class '${studentClass}' not found in your school`,
      });
    }
  // ──────────────────────────────────────────────
  // Hash parent's password (sent from frontend)
  // ──────────────────────────────────────────────
  const parentHashedPassword = await bcrypt.hash(password, 10);

  // ──────────────────────────────────────────────
  // Generate IDs
  // ──────────────────────────────────────────────
  const studentCountTotal = await User.countDocuments({ role: 'student' });
  const parentCountTotal = await User.countDocuments({ role: 'parent' });

  const studentId = `STD-${String(studentCountTotal + 1).padStart(4, '0')}`;
  const parentId = `PAR-${String(parentCountTotal + 1).padStart(4, '0')}`;

  // ──────────────────────────────────────────────
  // Create Parent
  // ──────────────────────────────────────────────
  const parent = await User.create({
    name: parentName,
    email: parentEmail.toLowerCase(),
    password: parentHashedPassword,
    tempPlainPassword: req.user.role === 'superadmin' ? password : undefined, // only superadmin sees it
    phone: parentPhone,
    role: 'parent',
    parentId,
    schoolName: req.user.schoolName,
    createdBy: req.user._id,
  });
 
  // ──────────────────────────────────────────────
  // Create Student
  // ──────────────────────────────────────────────
  const student = await User.create({
    name: studentName,
    email: studentEmail ? studentEmail.toLowerCase() : null,
    role: 'student',
    password: parentHashedPassword,
    studentId,
    class: studentClass,
    rollNumber: studentRollNumber, // auto-generated
    parent: parent._id,
    schoolName: req.user.schoolName,
    createdBy: req.user._id,
  });


      classDoc.students.push(student._id);
    await classDoc.save();
  // Link parent to student
  parent.children = [student._id];
  await parent.save();
  const digitalId = await generateDigitalId(student);
  // ──────────────────────────────────────────────
  // Response
  // ──────────────────────────────────────────────
  res.status(201).json({
    success: true,
    message: 'Student and parent created successfully',
    student: {
      _id: student._id,
      studentId: student.studentId,
      name: student.name,
      class: student.class,
      rollNumber: student.rollNumber, // e.g., LA01
      schoolName: student.schoolName,
      digitalId,
    },
    parent: {
      _id: parent._id,
      parentId: parent.parentId,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      schoolName: parent.schoolName,
      digitalId,
      // Only superadmin sees the plain password
      temporaryPassword: req.user.role === 'superadmin' ? password : undefined,
    },
  });

    } catch (error) {
    console.log(error)
    return res.status(500).json("an error occurred ")
  }
});
// ──────────────────────────────────────────────
// 4. Admin / Superadmin creates staff (accountant/librarian)
// ──────────────────────────────────────────────
export const createStaffMember = asyncHandler(async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { name, email, password, phone, role } = req.body;

  if (!['accountant', 'librarian'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid staff role' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const plainPassword = password || `${role}123`;
  const hashed = await bcrypt.hash(plainPassword, 10);

  const count = await User.countDocuments({ role, schoolName: req.user.schoolName });
  const prefix = role === 'accountant' ? 'ACC' : 'LIB';
  const staffId = `${prefix}-${String(count + 1).padStart(4, '0')}`;

  const staff = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    tempPlainPassword: plainPassword,
    phone,
    role,
    [`${role}Id`]: staffId,
    schoolName: req.user.schoolName,
    createdBy: req.user._id,
  });
    const digitalId = await generateDigitalId(staff);

  res.status(201).json({
    success: true,
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} created`,
    staff: {
      _id: staff._id,
      [`${role}Id`]: staffId,
      name,
      email,
      phone,
      role,
      schoolName: staff.schoolName,
      digitalId,
      temporaryPassword: req.user.role === 'superadmin' ? plainPassword : undefined,
    },
  });
});

// ──────────────────────────────────────────────
// 5. Superadmin sees all users with passwords
// ──────────────────────────────────────────────
export const getAllUsersForSuperadmin = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const users = await User.find({ createdBy: req.user._id }).select('+tempPlainPassword');

  const result = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    schoolName: u.schoolName,
    temporaryPassword: u.tempPlainPassword || '(Changed)',
    passwordLastChanged: u.passwordLastChanged || 'Not changed',
    createdBy: u.createdBy,
    createdAt: u.createdAt,
  }));

  res.json({
    success: true,
    count: result.length,
    users: result,
  });
});






export const getSuperadminStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const stats = {
    admins: await User.countDocuments({ role: 'admin' }),
    teachers: await User.countDocuments({ role: 'teacher' }),
    students: await User.countDocuments({ role: 'student' }),
    parents: await User.countDocuments({ role: 'parent' }),
    accountants: await User.countDocuments({ role: 'accountant' }),
    librarians: await User.countDocuments({ role: 'librarian' }),
  };

  res.json({ success: true, stats });
});







// ──────────────────────────────────────────────
// Get ALL users in the superadmin's school (including those created by admins)
// ──────────────────────────────────────────────
export const getAllUsersInSchool = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only superadmin can access this' });
  }

  const users = await User.find({ schoolName: req.user.schoolName })
    .select('+tempPlainPassword')
    .populate({
      path: 'createdBy',
      select: 'name email role'
    })
    .sort({ createdAt: -1 });

  const result = users.map(u => ({
    ...u.toObject(),
    createdByName: u.createdBy?.name || 'Superadmin',
    createdByEmail: u.createdBy?.email || req.user.email,
    createdByRole: u.createdBy?.role || 'superadmin',
    temporaryPassword: u.tempPlainPassword || '(changed)'
  }));

  res.json({
    success: true,
    total: result.length,
    users: result
  });
});

// ──────────────────────────────────────────────
// Edit any user (superadmin or the admin who created it)
// ──────────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Permission check
  const isSuperadmin = req.user.role === 'superadmin';
  const isCreator = user.createdBy?.toString() === req.user._id.toString();

  if (!isSuperadmin && !isCreator) {
    return res.status(403).json({ success: false, message: 'You do not have permission to edit this user' });
  }

  // Prevent changing role or schoolName for safety
  delete updates.role;
  delete updates.schoolName;

  // If password is being changed, hash it
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
    updates.tempPlainPassword = updates.password; // only superadmin sees it
    updates.needsPasswordReset = false;
  }

  const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

  res.json({
    success: true,
    message: 'User updated successfully',
    user: updatedUser
  });
});

// ──────────────────────────────────────────────
// Delete any user (superadmin or creator)
// ──────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Permission check
  const isSuperadmin = req.user.role === 'superadmin';
  const isCreator = user.createdBy?.toString() === req.user._id.toString();

  if (!isSuperadmin && !isCreator) {
    return res.status(403).json({ success: false, message: 'No permission to delete this user' });
  }

  // Prevent deleting superadmin or self
  if (user.role === 'superadmin' || user._id.toString() === req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Cannot delete superadmin or yourself' });
  }

  await User.findByIdAndDelete(id);

  res.json({ success: true, message: 'User deleted successfully' });
});



export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // 2. Find user by email (case-insensitive)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

 

  // 3. Check if account is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account is deactivated. Contact support.'
    });
  }

  // 4. Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // 5. Generate JWT token
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      schoolName: user.schoolName
    },
    process.env.JWT_SECRET || 'your-very-secure-secret-key',
    { expiresIn: '30d' }
  );

  // 6. Send response (do NOT send password or sensitive fields)
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolName: user.schoolName,
      // Add other safe fields if needed (phone, etc.)
    }
  });
});



































export const getAllStudents = asyncHandler(async (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const students = await User.find({
    role: 'student',
    schoolName: req.user.schoolName,
  }).select('name class rollNumber studentId profilePicture');

  res.json({
    success: true,
    count: students.length,
    students,
  });
});








































