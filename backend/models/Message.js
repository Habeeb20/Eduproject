import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    //   required: true,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
      },
    ],
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
    //   required: true,
      trim: true,
      maxlength: 5000,
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId, // For conversation threading (replies)
      ref: 'Message',
    },
    schoolName: {
      type: String,
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['sent', 'read', 'archived'],
      default: 'sent',
    },
  },
  { timestamps: true }
);

messageSchema.index({ schoolName: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ recipients: 1 });

export default mongoose.model('Message', messageSchema);