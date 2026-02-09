// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ['superadmin', 'admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'],
      required: true,
    },

    // Unique IDs per role
    studentId: { type: String, unique: true, sparse: true },
    teacherId: { type: String, unique: true, sparse: true },
    parentId: { type: String, unique: true, sparse: true },
    accountantId: { type: String, unique: true, sparse: true },
    librarianId: { type: String, unique: true, sparse: true },

    phone: { type: String, trim: true },
    avatar: String,

    schoolName: { type: String, required: true },

    // Relationships
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for students
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // for parents

    // Student specific
    class: String, // e.g. "JSS 1", "SSS 2"
    section: String, // e.g. "A", "B"
    rollNumber: String,
    admissionDate: { type: Date, default: Date.now },

    // Teacher specific
    subjects: [{ type: String }], // ["Mathematics", "Physics"]
    classTeacherOf: String, // "JSS 1 A"

tempPlainPassword: {
      type: String,
      select: false,           // never sent in normal queries
      required: false,
    },

    // When password is changed by user → clear tempPlainPassword
    passwordLastChanged: {
      type: Date,
    },

needsPasswordReset: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },

    lastLogin: Date,
    
    subscriptionType: {
    type: String,
    enum: ['quarterly', 'annual', null],
    default: null,
  },
  subscriptionStart: {
    type: Date,
  },
  subscriptionEnd: {
    type: Date,
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'pending'],
    default: 'pending',
  },
  // Payment history (array for tracking)
  payments: [{
    amount: { type: Number },
    reference: { type: String },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'success', 'failed'] },
  }],
  },

  { timestamps: true }
);

export default mongoose.model('User', userSchema);





































