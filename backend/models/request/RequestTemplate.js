import mongoose from "mongoose"

const requestTemplateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['leave', 'resignation', 'report'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String, // optional sub-category for reports (e.g., "bullying", "suggestion", "incident")
    trim: true,
  },
  content: {
    type: String,
    required: true,
    // Default placeholders like {{teacherName}}, {{date}}, {{lastWorkingDay}}, etc.
  },
  isActive: {
    type: Boolean,
    default: true,
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
}, {
  timestamps: true,
});

const RequestTemplate = mongoose.model('RequestTemplate', requestTemplateSchema);

export default RequestTemplate