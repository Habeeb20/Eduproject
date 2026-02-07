// // controllers/userController.js
// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import generateToken from '../utils/generateToken.js';
// import 'colors';

// export const createAdmin = async (req, res) => {
//   const { name, email, password, phone } = req.body;

//   try {
//     // Check if admin already exists
//     const adminExists = await User.findOne({ role: 'admin' });
//     if (adminExists) {
//       return res.status(400).json({
//         success: false,
//         message: 'School Admin already exists! Only one Admin allowed per school.'.yellow
//       });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const admin = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       phone,
//       role: 'admin',
//       createdBy: req.user._id, // Created by Super Admin
//       schoolName: req.user.schoolName // Inherit from Super Admin
//     });

//     console.log(`Admin Created: ${admin.name} by Super Admin ${req.user.name}`.green.bold);

//     res.status(201).json({
//       success: true,
//       message: 'School Admin created successfully!',
//       user: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         role: admin.role,
//         schoolName: admin.schoolName
//       }
//     });

//   } catch (error) {
//     console.log('Create Admin Error:'.red, error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// export const createTeacher = async (req, res) => {
//   const { name, email, password, phone, subjects } = req.body;

//   try {
//     // Check if teacher already exists
//     const teacherExists = await User.findOne({ email });
//     if (teacherExists) {
//       return res.status(400).json({
//         success: false,
//         message: 'Teacher with this email already exists!'.yellow
//       });
//     }

//     // Generate Teacher ID: TCH-001, TCH-002...
//     const count = await User.countDocuments({ role: 'teacher' });
//     const teacherId = `TCH-${String(count + 1).padStart(3, '0')}`;

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password || 'teacher123', salt); // default password if not given

//     const teacher = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       phone,
//       role: 'teacher',
//       teacherId, // custom field
//       subjects: subjects || [], // array of subjects they teach
//       createdBy: req.user._id,
//       schoolName: req.user.schoolName
//     });

//     console.log(`TEACHER CREATED → ${teacher.name} (${teacher.teacherId}) by ${req.user.role.toUpperCase()} ${req.user.name}`.cyan.bold);

//     res.status(201).json({
//       success: true,
//       message: 'Teacher created successfully!',
//       teacher: {
//         id: teacher._id,
//         teacherId: teacher.teacherId,
//         name: teacher.name,
//         email: teacher.email,
//         phone: teacher.phone,
//         subjects: teacher.subjects,
//         schoolName: teacher.schoolName
//       }
//     });

//   } catch (error) {
//     console.log('Create Teacher Error:'.red, error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// // controllers/userController.js → ADD THIS BEAST FUNCTION

// export const createStudentAndParent = async (req, res) => {
//   const {
//     studentName,
//     studentEmail,
//     studentClass,
//     section,
//     rollNumber,
//     parentName,
//     parentEmail,
//     parentPhone,
//     parentPassword = 'parent123' // default, they can change later
//   } = req.body;

//   try {
//     // Generate IDs
//     const studentCount = await User.countDocuments({ role: 'student' });
//     const parentCount = await User.countDocuments({ role: 'parent' });

//     const studentId = `STD-${String(studentCount + 1).padStart(3, '0')}`;
//     const parentId = `PAR-${String(parentCount + 1).padStart(3, '0')}`;

//     // Hash parent password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(parentPassword, salt);

//     // Create Parent First
//     const parent = await User.create({
//       name: parentName,
//       email: parentEmail.toLowerCase(),
//       password: hashedPassword,
//       phone: parentPhone,
//       role: 'parent',
//       parentId,
//       schoolName: req.user.schoolName,
//       createdBy: req.user._id
//     });

//     // Create Student & Link to Parent
//     const student = await User.create({
//       name: studentName,
//       email: studentEmail?.toLowerCase() || null,
//       role: 'student',
//       studentId,
//       class: studentClass,
//       section,
//       rollNumber,
//       parent: parent._id,           // Student → Parent link
//       schoolName: req.user.schoolName,
//       createdBy: req.user._id
//     });

//     // Link Student back to Parent
//     parent.children = [student._id];
//     await parent.save();

//     console.log(`STUDENT & PARENT CREATED`.bgMagenta.bold);
//     console.log(`Student: ${student.name} (${student.studentId}) → Class ${studentClass}`.green);
//     console.log(`Parent: ${parent.name} (${parent.parentId}) → Linked!`.cyan);

//     res.status(201).json({
//       success: true,
//       message: 'Student + Parent created and linked successfully!',
//       student: {
//         id: student._id,
//         studentId: student.studentId,
//         name: student.name,
//         class: student.class,
//         section: student.section,
//         rollNumber: student.rollNumber
//       },
//       parent: {
//         id: parent._id,
//         parentId: parent.parentId,
//         name: parent.name,
//         email: parent.email,
//         phone: parent.phone,
//         loginPassword: parentPassword // Show once (in real app: send via email)
//       }
//     });

//   } catch (error) {
//     console.log('Create Student+Parent Error:'.red, error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




// export const createStaff = async (req, res) => {
//   const { name, email, password, phone, role } = req.body;

//   // Only allow these two roles
//   if (!['accountant', 'librarian'].includes(role)) {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid role! Use accountant or librarian'.red
//     });
//   }

//   try {
//     // Check if email already exists
//     const exists = await User.findOne({ email: email.toLowerCase() });
//     if (exists) {
//       return res.status(400).json({
//         success: false,
//         message: `${role.charAt(0).toUpperCase() + role.slice(1)} with this email already exists!`.yellow
//       });
//     }

//     // Generate Staff ID
//     const count = await User.countDocuments({ role });
//     const staffPrefix = role === 'accountant' ? 'ACC' : 'LIB';
//     const staffId = `${staffPrefix}-${String(count + 1).padStart(3, '0')}`;

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password || `${role}123`, salt);

//     const staff = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       phone,
//       role,
//       [`${role}Id`]: staffId, // accountantId or librarianId
//       schoolName: req.user.schoolName,
//       createdBy: req.user._id
//     });

//     console.log(`${role.toUpperCase()} CREATED → ${staff.name} (${staffId})`.rainbow.bold);

//     res.status(201).json({
//       success: true,
//       message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`,
//       staff: {
//         id: staff._id,
//         staffId: staffId,
//         name: staff.name,
//         email: staff.email,
//         phone: staff.phone,
//         role: staff.role,
//         loginPassword: password || `${role}123` // show once (in prod: send via email)
//       }
//     });

//   } catch (error) {
//     console.log(`Create ${role} Error:`.red, error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// controllers/adminController.js
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

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
      temporaryPassword: plainPassword, // Superadmin sees it
    },
  });
});

// ──────────────────────────────────────────────
// 2. Admin / Superadmin creates teacher
// ──────────────────────────────────────────────
export const createTeacher = asyncHandler(async (req, res) => {
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
      temporaryPassword: req.user.role === 'superadmin' ? plainPassword : undefined,
    },
  });
});

// ──────────────────────────────────────────────
// 3. Admin / Superadmin creates student + parent
// ──────────────────────────────────────────────
export const createStudentWithParent = asyncHandler(async (req, res) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const {
    studentName,
    studentEmail,
    studentClass,
    section,
    rollNumber,
    parentName,
    parentEmail,
    parentPhone,
  } = req.body;

  // Check duplicates
  if (studentEmail && await User.findOne({ email: studentEmail.toLowerCase() })) {
    return res.status(400).json({ success: false, message: 'Student email exists' });
  }
  if (await User.findOne({ email: parentEmail.toLowerCase() })) {
    return res.status(400).json({ success: false, message: 'Parent email exists' });
  }

  const studentCount = await User.countDocuments({ role: 'student', schoolName: req.user.schoolName });
  const parentCount = await User.countDocuments({ role: 'parent', schoolName: req.user.schoolName });

  const studentId = `STD-${String(studentCount + 1).padStart(4, '0')}`;
  const parentId = `PAR-${String(parentCount + 1).padStart(4, '0')}`;

  const parentPlainPassword = 'parent123'; // TODO: Generate random in prod
  const parentHashed = await bcrypt.hash(parentPlainPassword, 10);

  const parent = await User.create({
    name: parentName,
    email: parentEmail.toLowerCase(),
    password: parentHashed,
    tempPlainPassword: parentPlainPassword,
    phone: parentPhone,
    role: 'parent',
    parentId,
    schoolName: req.user.schoolName,
    createdBy: req.user._id,
  });

  const student = await User.create({
    name: studentName,
    email: studentEmail ? studentEmail.toLowerCase() : null,
    role: 'student',
    studentId,
    class: studentClass,
    section,
    rollNumber,
    parent: parent._id,
    schoolName: req.user.schoolName,
    createdBy: req.user._id,
  });

  parent.children = [student._id];
  await parent.save();

  res.status(201).json({
    success: true,
    message: 'Student and parent created',
    student: {
      _id: student._id,
      studentId,
      name: studentName,
      class: studentClass,
      section,
      rollNumber,
      schoolName: student.schoolName,
    },
    parent: {
      _id: parent._id,
      parentId,
      name: parentName,
      email: parentEmail,
      phone: parentPhone,
      schoolName: parent.schoolName,
      temporaryPassword: req.user.role === 'superadmin' ? parentPlainPassword : undefined,
    },
  });
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

  const users = await User.find({}).select('+tempPlainPassword');

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