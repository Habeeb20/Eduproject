import asyncHandler from 'express-async-handler';

import Payroll from '../models/payroll.js';
import User from '../models/User.js';

// Create/save payroll (accountant)
export const createPayroll = asyncHandler(async (req, res) => {
  const { month, employeeId, salary, bonuses, deductions, netSalary } = req.body;

  const employee = await User.findById(employeeId);
  if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

  const payroll = await Payroll.create({
    month,
    employee: employeeId,
    salary,
    bonuses,
    deductions,
    netSalary,
    createdBy: req.user._id,
    schoolName: req.user.schoolName,
  });

  res.status(201).json({ success: true, payroll });
});

// Publish payroll (accountant)
export const publishPayroll = asyncHandler(async (req, res) => {
  const { payrollId } = req.params;

  const payroll = await Payroll.findById(payrollId);
  if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });

  if (payroll.published) return res.status(400).json({ success: false, message: 'Already published' });

  payroll.published = true;
  await payroll.save();

  res.json({ success: true, payroll });
});

// Get my payrolls (staff/teacher/admin)
export const getMyPayrolls = asyncHandler(async (req, res) => {
  const payrolls = await Payroll.find({
    employee: req.user._id,
    published: true,
    schoolName: req.user.schoolName,
  })
    .populate('employee', 'name role')
    .sort({ month: -1 });

  res.json({ success: true, payrolls });
});

// Get all payrolls (accountant/admin/superadmin)
export const getAllPayrolls = asyncHandler(async (req, res) => {
  const payrolls = await Payroll.find({ schoolName: req.user.schoolName })
    .populate('employee', 'name role')
    .sort({ month: -1, createdAt: -1 });

  res.json({ success: true, payrolls });
});