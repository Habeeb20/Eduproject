import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import Class from '../models/class/classModel.js';
import Result from '../models/class/resultModel.js';
import TeacherAttendance from "../models/attendance/DailyQRAttendance.js"

import StudentAttendance from "../models/attendance/DailyQRAttendance.js";
import 'colors';



// Register First Super Admin (Only once)
export const registerSuperAdmin = async (req, res) => {
  const { name, email, password, schoolName } = req.body;

  try {
    // Check if any user exists
    // const existingUser = await User.countDocuments();
    // if (existingUser > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Super Admin already exists! This route is only for first-time setup."
    //   });
    // }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const superadmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'superadmin',
      schoolName
    });

    res.status(201).json({
      success: true,
      token: generateToken(superadmin._id),
      user: {
        id: superadmin._id,
        name: superadmin.name,
        email: superadmin.email,
        role: superadmin.role,
        schoolName: superadmin.schoolName
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login Any User
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolName: user.schoolName,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEnd: user.subscriptionEnd

      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const dashboard = async(req, res) =>{
  const userId = req.user._id || req.user.id

  try {
    const user = await User.findOne(userId)
    return res.status(200).json({ user})
  } catch (error) {
   console.log(error)
   return res.status(500).json() 
  }
}








// SUPERADMIN SEES EVERYTHING IN THE SCHOOL
export const getSchoolOverview = async (req, res) => {
  try {
    const superadmin = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Count All Roles
    const totalTeachers = await User.countDocuments({ role: 'teacher', schoolName: superadmin.schoolName });
    const totalStudents = await User.countDocuments({ role: 'student', schoolName: superadmin.schoolName });
    const totalParents = await User.countDocuments({ role: 'parent', schoolName: superadmin.schoolName });
    const totalAdmins = await User.countDocuments({ role: 'admin', schoolName: superadmin.schoolName });
    const totalAccountants = await User.countDocuments({ role: 'accountant', schoolName: superadmin.schoolName });
    const totalLibrarians = await User.countDocuments({ role: 'librarian', schoolName: superadmin.schoolName });

    // 2. Today's Attendance
    const todayTeacherAttendance = await TeacherAttendance.find({ date: today });
    const todayStudentAttendance = await StudentAttendance.find({ date: today });

    const presentTeachersToday = todayTeacherAttendance.length;
    const presentStudentsToday = todayStudentAttendance.length;

    // 3. Classes & Results
    const totalClasses = await Class.countDocuments({ schoolName: superadmin.schoolName });
    const publishedResults = await Result.countDocuments({ published: true });

    // 4. Recent Activity (Last 10 logins or actions)
    const recentUsers = await User.find({ schoolName: superadmin.schoolName })
      .select('name role lastLogin')
      .sort({ lastLogin: -1 })
      .limit(10);

    console.log(`SUPERADMIN DASHBOARD ACCESSED → ${superadmin.name} (${superadmin.schoolName})`.rainbow.bold);

    res.json({
      success: true,
      school: superadmin.schoolName,
      overview: {
        totalTeachers,
        totalStudents,
        totalParents,
        totalAdmins,
        totalAccountants,
        totalLibrarians,
        totalClasses,
        publishedResults,
        todayAttendance: {
          teachersPresent: presentTeachersToday,
          studentsPresent: presentStudentsToday,
          teacherPercentage: totalTeachers > 0 ? Math.round((presentTeachersToday / totalTeachers) * 100) : 0,
          studentPercentage: totalStudents > 0 ? Math.round((presentStudentsToday / totalStudents) * 100) : 0
        }
      },
      recentActivity: recentUsers.map(u => ({
        name: u.name,
        role: u.role,
        lastSeen: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"
      }))
    });

  } catch (error) {
    console.error("SuperAdmin Dashboard Error:".red, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL TEACHERS
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: 'teacher', 
      schoolName: req.user.schoolName 
    }).select('name email phone teacherId createdAt');

    res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL STUDENTS
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ 
      role: 'student', 
      schoolName: req.user.schoolName 
    })
    .select('name email studentId class section rollNumber currentClass')
    .populate('currentClass', 'className section classCode');

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL PARENTS
export const getAllParents = async (req, res) => {
  try {
    const parents = await User.find({ 
      role: 'parent', 
      schoolName: req.user.schoolName 
    })
    .select('name email phone parentId children')
    .populate('children', 'name studentId class');

    res.json({ success: true, count: parents.length, parents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL CLASSES
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({ schoolName: req.user.schoolName })
      .populate('classTeacher', 'name')
      .populate('students', 'name studentId');

    res.json({ success: true, count: classes.length, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL RESULTS (Published Only)
export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find({ published: true })
      .populate('student', 'name studentId')
      .select('subject term session total grade');

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SCHOOL STAFF (Admin, Accountant, Librarian)
export const getSchoolStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ['admin', 'accountant', 'librarian'] },
      schoolName: req.user.schoolName
    }).select('name email role accountantId librarianId createdAt');

    res.json({ success: true, count: staff.length, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





// SUPERADMIN EDIT ANY USER (Teacher, Student, Parent, Admin, etc.)
export const editUser = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body; // name, email, phone, role, etc.
  const superadmin = req.user;

  try {
    // Prevent editing himself (optional safety)
    if (userId === superadmin._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot edit yourself here. Use profile settings." 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent role downgrade of another superadmin (extra security)
    if (user.role === 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot edit another Super Admin!" 
      });
    }

    // Allow editing everything except password and role (optional)
    const allowedFields = ['name', 'email', 'phone', 'teacherId', 'studentId', 'parentId', 'class', 'section'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    await user.save();

    console.log(`USER EDITED BY SUPERADMIN → ${user.name} (${user.role})`.cyan.bold);

    res.json({
      success: true,
      message: "User updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error("Edit User Error:".red, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// SUPERADMIN DELETE ANY USER (Permanent Delete)
export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const superadmin = req.user;

  try {
    if (userId === superadmin._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot delete yourself!" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot delete another Super Admin!" 
      });
    }

    // Optional: Delete related data (results, attendance, etc.)
    await Result.deleteMany({ student: userId });
    await TeacherAttendance.deleteMany({ teacher: userId });
    await StudentAttendance.deleteMany({ student: userId });

    await User.findByIdAndDelete(userId);

    console.log(`USER DELETED BY SUPERADMIN → ${user.name} (${user.role}) | ID: ${userId}`.red.bold.bgWhite);

    res.json({
      success: true,
      message: `${user.name} (${user.role}) has been permanently deleted.`,
      deletedUser: {
        name: user.name,
        role: user.role,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Delete User Error:".red, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getCurrentUser = async (req, res) => {
  // req.user is already set by your protect middleware
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  // Return safe user data (never send password or sensitive fields)
  const user = await User.findById(req.user._id).select(
    '-password -tempPlainPassword' // exclude sensitive fields
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolName: user.schoolName,
      phone: user.phone,

      subscriptionType: user.subscriptionType,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      subscriptionStatus: user.subscriptionStatus,
    
    },
    subscription:{
      
      subscriptionType: user.subscriptionType,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      subscriptionStatus: user.subscriptionStatus,
    }
  });
};




export const getAllStudents1 = async (req, res) => {

  const students = await User.find({
    role: 'student',
    schoolName: req.user.schoolName,
  }).select('name class rollNumber studentId profilePicture');

  res.json({
    success: true,
    count: students.length,
    students,
  });
};
