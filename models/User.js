import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'],
    default: 'teacher'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schoolName: String,
 

teacherId: { type: String, unique: true, sparse: true }, // only for teachers
studentId: { type: String, unique: true, sparse: true }, // for students later
subjects: [{ type: String }], // e.g., ["Math", "Physics"]
classTeacherOf: { type: String }, // e.g., "10-A"
  phone: String,
  avatar: String,
  isActive: { type: Boolean, default: true },


  // Inside userSchema → ADD THESE

studentId: { type: String, unique: true, sparse: true },
parentId: { type: String, unique: true, sparse: true },

// For Students
admissionDate: { type: Date, default: Date.now },
class: String,        // e.g., "10-A"
section: String,
rollNumber: String,
parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // links to Parent
// Inside userSchema → ADD THESE
currentClass: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'Class' 
},
classCode: { type: String },

// For Parents
children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // links to Students
}, { timestamps: true });

export default mongoose.model('User', userSchema);