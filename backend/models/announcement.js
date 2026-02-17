import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Visibility control
    targetAudience: {
      type: String,
      enum: ['teachers_staff', 'students', 'all'],
      required: true,
      default: 'all',
    },
    // Optional: expiry date (auto-hide after this date)
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // For analytics (optional)
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for fast querying active announcements
announcementSchema.index({ isActive: 1, expiresAt: 1, createdAt: -1 });

export default mongoose.model('Announcement', announcementSchema);