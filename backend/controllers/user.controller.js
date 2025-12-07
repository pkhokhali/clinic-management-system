const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

// @desc    Create user (Admin/Super Admin only)
// @route   POST /api/users
// @access  Private (Admin, Super Admin)
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, dateOfBirth, gender, address, specialization, licenseNumber, bloodGroup, emergencyContact } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: password || 'Default@123', // Default password if not provided
      role: role || 'Patient',
      dateOfBirth,
      gender,
      address,
      specialization,
      licenseNumber,
      bloodGroup,
      emergencyContact
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Super Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check permissions
    if (
      req.user.role !== 'Super Admin' &&
      req.user.role !== 'Admin' &&
      req.user.id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check permissions
    if (
      req.user.role !== 'Super Admin' &&
      req.user.role !== 'Admin' &&
      req.user.id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user',
      });
    }

    // Remove password from update if present
    const { password, ...updateData } = req.body;

    user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin, Super Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};
