const jwt = require('jsonwebtoken');
const db = require('../config/database');

const roleBasedAccess = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // Admin bypasses all role checks
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. ${req.user.role}s cannot access this resource.` 
      });
    }
    
    next();
  };
};

const verifiedOnly = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  // Admin bypasses verification
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (!req.user.is_verified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Account verification required. Please wait for admin approval.' 
    });
  }
  
  next();
};

const alumniOnly = async (req, res, next) => {
  if (!req.user || req.user.role !== 'alumni') {
    return res.status(403).json({ 
      success: false, 
      message: 'Alumni access required' 
    });
  }
  
  if (!req.user.is_verified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Alumni verification required' 
    });
  }
  
  next();
};

const studentOnly = async (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ 
      success: false, 
      message: 'Student access required' 
    });
  }
  
  if (!req.user.is_verified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Student verification required' 
    });
  }
  
  next();
};

const adminOnly = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

module.exports = { 
  roleBasedAccess, 
  verifiedOnly, 
  alumniOnly, 
  studentOnly, 
  adminOnly 
};