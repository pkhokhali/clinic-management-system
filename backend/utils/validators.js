const { body } = require('express-validator');

exports.validateRegister = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Lab Technician', 'Patient'])
    .withMessage('Invalid role'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  
  body('specialization')
    .optional()
    .trim(),
  
  body('licenseNumber')
    .optional()
    .trim(),
  
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group')
];

exports.validateLogin = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];
