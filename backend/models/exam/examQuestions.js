import mongoose from 'mongoose';

const examQuestionSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
  type: String,
  enum: ['draft', 'published'],
  default: 'draft',
},
    isCBT: {
      type: Boolean,
      default: false,
    },
    cbtAvailableFrom: {
      type: Date,
      default: null,
    },
    questions: [
      {
        type: {
          type: String,
          enum: ['multiple_choice', 'essay', 'fill_in_blank', 'true_false'],
          required: true,
        },
        questionText: { type: String, required: true },
        options: [String], // for MCQ
        correctAnswer: String, // for MCQ / TF
        marks: { type: Number, required: true, min: 1 },
        imageUrl: String, // optional image per question
      },
    ],
    schoolName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('ExamQuestion', examQuestionSchema);