import mongoose from "mongoose";
const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
answers: { 
    type: Map, 
    of: String, 
    default: () => new Map()   
  },
  score: { type: Number },
  totalQuestions: { type: Number },
  percentage: { type: Number },
  timeTakenSeconds: { type: Number },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
}, { timestamps: true });

// models/TestAttempt.js
attemptSchema.pre('save', function (next) {
  if (this.answers instanceof Map) {
    const normalized = new Map();
    for (const [key, value] of this.answers) {
      normalized.set(String(key), value); // always string keys
    }
    this.answers = normalized;
  }

});

export default mongoose.model("TestAttempt", attemptSchema);