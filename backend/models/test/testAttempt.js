import mongoose from "mongoose";
const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
answers: { 
    type: Map, 
    of: String, 
    default: () => new Map()   // ← This is the fix
  },
  score: { type: Number },
  totalQuestions: { type: Number },
  percentage: { type: Number },
  timeTakenSeconds: { type: Number },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
}, { timestamps: true });

export default mongoose.model("TestAttempt", attemptSchema);