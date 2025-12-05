// models/Class.js
import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: { 
    type: String, 
    required: true 
  }, // e.g., "JSS 2", "SS 1", "Grade 10"
  section: { 
    type: String, 
    required: true 
  }, // A, B, Gold, Diamond
  classCode: { 
    type: String, 
    unique: true, 
    required: true 
  }, // e.g., CL827
  classTeacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, // Optional
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  totalStudents: { 
    type: Number, 
    default: 0 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  schoolName: String
}, { timestamps: true });

// Auto generate 3-digit class code before save
classSchema.pre('save', async function(next) {
  if (!this.classCode) {
    let code;
    do {
      code = `CL${Math.floor(100 + Math.random() * 900)}`;
    } while (await this.constructor.findOne({ classCode: code }));
    this.classCode = code;
  }
  next();
});

export default mongoose.model('Class', classSchema);