// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['new_message', 'reply', 'system', 'group_join', 'group_message'],
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    link: String, // e.g. /messages/thread/:threadId
    referenceId: mongoose.Schema.Types.ObjectId, // e.g. message ID
    read: { type: Boolean, default: false },
    schoolName: { type: String, required: true },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);