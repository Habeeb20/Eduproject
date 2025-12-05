// controllers/classController.js
import Class from '../models/class/classModel.js';
import User from '../models/User.js';

import 'colors';

// CREATE CLASS
export const createClass = async (req, res) => {
  const { className, section, classTeacherId } = req.body;
  const creator = req.user;

  try {
    const classExists = await Class.findOne({ 
      className, 
      section, 
      schoolName: creator.schoolName 
    });

    if (classExists) {
      return res.status(400).json({ 
        success: false, 
        message: `${className}-${section} already exists!` 
      });
    }

    const newClass = await Class.create({
      className,
      section,
      classTeacher: classTeacherId || null,
      createdBy: creator._id,
      schoolName: creator.schoolName
    });

    console.log(`CLASS CREATED → ${newClass.className}-${newClass.section} | Code: ${newClass.classCode}`.bgGreen.white.bold);

    res.status(201).json({
      success: true,
      message: "Class created successfully!",
      class: newClass
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD STUDENT TO CLASS
export const addStudentToClass = async (req, res) => {
  const { classId, studentId } = req.body;

  try {
    const classRoom = await Class.findById(classId);
    const student = await User.findById(studentId);

    if (!classRoom || !student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: "Class or Student not found" });
    }

    if (classRoom.students.includes(studentId)) {
      return res.status(400).json({ success: false, message: "Student already in class" });
    }

    classRoom.students.push(studentId);
    classRoom.totalStudents = classRoom.students.length;
    await classRoom.save();

    // Update student's current class
    student.currentClass = classRoom._id;
    student.classCode = classRoom.classCode;
    await student.save();

    console.log(`STUDENT ADDED → ${student.name} to ${classRoom.className}-${classRoom.section}`.cyan.bold);

    res.json({
      success: true,
      message: `${student.name} added to ${classRoom.className}-${classRoom.section}`,
      classCode: classRoom.classCode
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL CLASSES (Admin/Teacher)
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({ schoolName: req.user.schoolName })
      .populate('classTeacher', 'name')
      .populate('students', 'name studentId')
      .sort({ className: 1, section: 1 });

    res.json({ success: true, count: classes.length, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// STUDENT SEES THEIR CLASS
export const getMyClass = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).populate('currentClass');
    if (!student.currentClass) {
      return res.json({ success: true, message: "Not assigned to any class yet" });
    }

    const classInfo = await Class.findById(student.currentClass._id)
      .populate('classTeacher', 'name')
      .populate('students', 'name studentId');

    res.json({
      success: true,
      myClass: {
        name: `${classInfo.className}-${classInfo.section}`,
        code: classInfo.classCode,
        totalStudents: classInfo.totalStudents,
        classTeacher: classInfo.classTeacher?.name || "Not assigned"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PARENT SEES CHILD'S CLASS
export const getChildClass = async (req, res) => {
  try {
    const children = await User.find({ parent: req.user._id, role: 'student' })
      .populate('currentClass');

    const result = children.map(child => ({
      name: child.name,
      studentId: child.studentId,
      class: child.currentClass 
        ? `${child.currentClass.className}-${child.currentClass.section} (${child.currentClass.classCode})`
        : "Not assigned yet"
    }));

    res.json({ success: true, childrenClasses: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};