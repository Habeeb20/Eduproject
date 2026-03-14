import mongoose from "mongoose";

const requestSubmissionSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RequestTemplate',
    required: true,
  },
  type: {
    type: String,
    enum: ['leave', 'resignation', 'report'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  // Leave-specific fields
  startDate: Date,
  endDate: Date,
  // Resignation-specific
  lastWorkingDay: Date,
  // Report-specific
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'acknowledged', 'reviewed'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewComment: String,
  schoolName: String,
}, {
  timestamps: true,
});

const RequestSubmission = mongoose.model('RequestSubmission', requestSubmissionSchema);

export default RequestSubmission