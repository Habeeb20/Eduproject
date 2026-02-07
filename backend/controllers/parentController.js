import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import 'colors';


export const getMyChildren = async (req, res) => {
  try {
    // Find all students linked to this parent
    const children = await User.find({ 
      'parent': req.user._id 
    }).select('-password');

    if (children.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No children found. Contact school admin.",
        children: []
      });
    }

    console.log(`Parent ${req.user.name} (${req.user.parentId}) viewed their ${children.length} child(ren)`.magenta.bold);

    res.status(200).json({
      success: true,
      parent: {
        name: req.user.name,
        parentId: req.user.parentId,
        email: req.user.email,
        phone: req.user.phone
      },
      totalChildren: children.length,
      children: children.map(child => ({
        id: child._id,
        studentId: child.studentId,
        name: child.name,
        class: child.class,
        section: child.section,
        rollNumber: child.rollNumber,
        admissionDate: child.admissionDate,
        // Future fields we'll add:
        // attendancePercentage: 98.5,
        // totalFeesDue: 45000,
        // lastExamGrade: "A1",
        // pendingHomework: 2
      }))
    });

  } catch (error) {
    console.log('Parent Dashboard Error:'.red, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};