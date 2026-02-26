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




// controllers/payrollController.js
export const updatePayroll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { month, employeeId, salary, bonuses, deductions, netSalary } = req.body;

  const payroll = await Payroll.findById(id);
  if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });

  // Only accountant who created it or admin/superadmin can edit
  if (
    payroll.createdBy.toString() !== req.user._id.toString() &&
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    return res.status(403).json({ success: false, message: 'Unauthorized to edit this payroll' });
  }

  payroll.month = month || payroll.month;
  payroll.employee = employeeId || payroll.employee;
  payroll.salary = salary ?? payroll.salary;
  payroll.bonuses = bonuses ?? payroll.bonuses;
  payroll.deductions = deductions || payroll.deductions;
  payroll.netSalary = netSalary ?? payroll.netSalary;

  await payroll.save();

  res.json({ success: true, payroll });
});







export const deletePayroll = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payroll = await Payroll.findById(id);
  if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });

  // Only creator or admin/superadmin can delete
  if (
    payroll.createdBy.toString() !== req.user._id.toString() &&
    !['admin', 'superadmin'].includes(req.user.role)
  ) {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this payroll' });
  }

  await payroll.deleteOne();

  res.json({ success: true, message: 'Payroll deleted' });
});