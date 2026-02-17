// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import 'colors';

import asyncHandler from 'express-async-handler';


// Protect routes - verify JWT
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - No token provided'.red
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    console.log('Token verification failed:'.red, err.message);
    return res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
};

// Restrict to specific roles
export const authorize = (...roles) => {

  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied! ${req.user.role} cannot perform this action`
      });
    }
    next();
  };
};



export const schoolOnly = (req, res, next) => {
  if (!req.user.schoolId) {
    return res.status(403).json({ message: "Access denied: school required" });
  }
  next();
};



export const checkSubscription = asyncHandler(async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  let superadminUser;

  if (req.user.role === 'superadmin') {
    superadminUser = req.user;
  } else {
    // Find superadmin of this user's school
    superadminUser = await User.findOne({
      role: 'superadmin',
      schoolName: req.user.schoolName
    });
  }

  if (!superadminUser) {
    return res.status(403).json({ message: 'No superadmin found for this school' });
  }

  const now = new Date();
  if (superadminUser.subscriptionStatus !== 'active' || now > superadminUser.subscriptionEnd) {
    return res.status(403).json({
      success: false,
      message: 'Subscription expired. Please renew to continue using the system.'
    });
  }

  next();
});






export const checkSuperadminSubscription = asyncHandler(async (req, res, next) => {
  // Superadmin himself can always access (to renew)
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Find the superadmin of this school
  const superadmin = await User.findOne({
    role: 'superadmin',
    schoolName: req.user.schoolName,
  });

  if (!superadmin) {
    return res.status(403).json({
      success: false,
      message: 'No superadmin found for this school. Contact support.',
    });
  }

  const now = new Date();

  // Check if subscription is active
  if (
    superadmin.subscriptionStatus !== 'active' ||
    !superadmin.subscriptionEnd ||
    now > new Date(superadmin.subscriptionEnd)
  ) {
    return res.status(403).json({
      success: false,
      message: 'School subscription has expired. Please contact your superadmin to renew.',
      subscriptionExpired: true,
      subscriptionEnd: superadmin.subscriptionEnd
        ? superadmin.subscriptionEnd.toISOString()
        : null,
    });
  }

  next();
});