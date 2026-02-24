import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    month: { type: String, required: true }, // e.g. "2023-10"
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    salary: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    deductions: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    netSalary: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    published: { type: Boolean, default: false },
    schoolName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Payroll', payrollSchema);