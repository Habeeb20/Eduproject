import mongoose from "mongoose";
const testSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  subject: { type: String, required: true },
  classNames: [{ type: String }], 
  term: { type: String, enum: ["First Term", "Second Term", "Third Term"], required: true },
  durationMinutes: { type: Number, default: 60, min: 5, max: 180 },
  totalQuestions: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  schoolName: { type: String, required: true },
  status: { type: String, enum: ["draft", "active", "closed"], default: "draft" },
  startDate: { type: Date },
  endDate: { type: Date },
  questions: [
    {
      questionText: { type: String, required: true },
      optionA: { type: String, required: true },
      optionB: { type: String, required: true },
      optionC: { type: String, required: true },
      optionD: { type: String, required: true },
      correctOption: { type: String, enum: ["A", "B", "C", "D"], required: true },
      explanation: { type: String },
    },
  ],
}, { timestamps: true });

export default mongoose.model("Test", testSchema);