import mongoose from 'mongoose';

const virtualClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: true,
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
    targetType: {
      type: String,
      enum: ['students', 'classes'],
      required: true,
    },
    targetClasses: [{
      type: String, // class names e.g. "JSS 1 A", "SSS 2 Science"
    }],
    targetStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    history: [{
      status: String,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      changedAt: { type: Date, default: Date.now },
      note: String,
    }],
  },
  { timestamps: true }
);

virtualClassSchema.pre('save', function(next) {
  if (this.isNew) {
    this.history.push({
      status: this.status,
      changedBy: this.teacher,
      note: 'Created',
    });
  }

});

export default mongoose.model('VirtualClass', virtualClassSchema);