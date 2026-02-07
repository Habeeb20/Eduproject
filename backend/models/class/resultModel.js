// models/Result.js
import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: String,
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: String, required: true }, // e.g., Mathematics
  term: { type: String, enum: ['First Term', 'Second Term', 'Third Term'], required: true },
  session: { type: String, required: true }, // e.g., "2024/2025"

  // Scores
  test1: { type: Number, min: 0, max: 10, default: 0 },
  test2: { type: Number, min: 0, max: 10, default: 0 },
  test3: { type: Number, min: 0, max: 10, default: 0 },
  project: { type: Number, min: 0, max: 10, default: 0 },
  exam: { type: Number, min: 0, max: 70, default: 0 },

  // Extra-curricular (optional)
  attendanceScore: { type: Number, min: 0, max: 10, default: 0 },
  behavior: { type: Number, min: 0, max: 10, default: 0 },
  sports: { type: Number, min: 0, max: 10, default: 0 },

  total: { type: Number, default: 0 },
  grade: { type: String, default: "" },
  remark: { type: String, default: "" },

  // Weight set by teacher
  weights: {
    tests: { type: Number, default: 30 },     // 30%
    exam: { type: Number, default: 70 },      // 70%
    extra: { type: Number, default: 10 }      // bonus from behavior/sports
  },

  published: { type: Boolean, default: false },
  publishedAt: Date,
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto calculate total & grade before save
resultSchema.pre('save', function(next) {
  const testsTotal = this.test1 + this.test2 + this.test3 + this.project;
  const caScore = (testsTotal / 40) * this.weights.tests;
  const examScore = (this.exam / 70) * this.weights.exam;
  const extraScore = (this.attendanceScore + this.behavior + this.sports) / 30 * this.weights.cleaned;

  this.total = Math.round(caScore + examScore + extraScore);
  
  // Grading system (Nigerian Standard)
  if (this.total >= 75) this.grade = "A1";
  else if (this.total >= 70) this.grade = "B2";
  else if (this.total >= 65) this.grade = "B3";
  else if (this.total >= 60) this.grade = "C4";
  else if (this.total >= 55) this.grade = "C5";
  else if (this.total >= 50) this.grade = "C6";
  else if (this.total >= 45) this.grade = "D7";
  else if (this.total >= 40) this.grade = "E8";
  else this.grade = "F9";

  this.remark = this.total >= 50 ? "Pass" : "Fail";

  next();
});

export default mongoose.model('Result', resultSchema);