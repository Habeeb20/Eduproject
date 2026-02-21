// models/Group.js
import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isBlocked: { type: Boolean, default: false }, 
    type: {
      type: String,
      enum: ['teacher_class', 'school_wide'],
      default: 'teacher_class',
    },
  },
  { timestamps: true }
);

groupSchema.index({ schoolName: 1, createdAt: -1 });

export default mongoose.model('Group', groupSchema);