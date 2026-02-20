import mongoose from 'mongoose';

const lessonNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
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
    term: {
      type: String,
      required: true,
      enum: ['First Term', 'Second Term', 'Third Term'],
    },
    week: {
      type: Number,
      required: true,
      min: 1,
      max: 40,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true, // Cloudinary or S3 secure URL
    },
    filePublicId: {
      type: String, // For deleting/updating file later
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

lessonNoteSchema.index({ schoolName: 1, status: 1, createdAt: -1 });

export default mongoose.model('LessonNote', lessonNoteSchema);