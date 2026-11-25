const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt');

// Email validation helper
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (Admin role requires authorization key)
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      userId,
      department,
      rollNo,
      year,
      hostel,
      phone,
      avatar,
    } = req.body;

    // 1. Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!isValidEmail(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email address format' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }
    if (!userId || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'User ID / Registration ID is required',
      });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is required' });
    }

    const requestedRole = typeof role === 'string' ? role.toLowerCase() : 'student';
    if (requestedRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts must be provisioned by a system administrator.',
      });
    }
    if (!['student', 'staff'].includes(requestedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid account role' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUserId = userId.trim();

    // 3. Check for duplicate email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // 4. Check for duplicate User ID
    const existingUserId = await User.findOne({ userId: cleanUserId });
    if (existingUserId) {
      return res.status(400).json({
        success: false,
        message: `User ID / Registration ID "${cleanUserId}" is already in use`,
      });
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Create User
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: requestedRole,
      userId: cleanUserId,
      rollNo: rollNo || cleanUserId,
      department: department.trim(),
      division: req.body.division || 'A',
      year: year || '1st Year',
      hostel: hostel || 'Hostel Block A',
      phone: phone || '+91 99999 00000',
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    // 7. Generate JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, userId: newUser.userId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: newUser.userId,
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      roleLabel:
        newUser.role === 'admin'
          ? 'Campus Administrator'
          : newUser.role === 'staff'
          ? `${newUser.name} (${newUser.department} Technician)`
          : 'Student',
      department: newUser.department,
      division: newUser.division || 'A',
      rollNo: newUser.rollNo,
      year: newUser.year,
      hostel: newUser.hostel,
      phone: newUser.phone,
      avatar: newUser.avatar,
    };

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const rawIdentifier = typeof identifier === 'string' ? identifier : email;
    const loginIdentifier = typeof rawIdentifier === 'string' ? rawIdentifier.trim() : '';

    if (!loginIdentifier || typeof password !== 'string' || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email or admin ID and password',
      });
    }

    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { userId: loginIdentifier },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/admin ID or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/admin ID or password',
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, userId: user.userId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.userId,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel:
        user.role === 'admin'
          ? 'Campus Administrator'
          : user.role === 'staff'
          ? `${user.name} (${user.department} Technician)`
          : 'Student',
      department: user.department,
      division: user.division || 'A',
      rollNo: user.rollNo,
      year: user.year,
      hostel: user.hostel,
      phone: user.phone,
      avatar: user.avatar,
    };

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Public / Protected
exports.updateProfile = async (req, res) => {
  try {
    const { email, name, phone, hostel, avatar, division, department, year, rollNo } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : req.user?.email;

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          ...(name && { name: name.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(hostel && { hostel: hostel.trim() }),
          ...(avatar && { avatar }),
          ...(division && { division: division.trim() }),
          ...(department && { department: department.trim() }),
          ...(year && { year: year.trim() }),
          ...(rollNo && { rollNo: rollNo.trim(), userId: rollNo.trim() }),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    const safeUser = {
      id: updatedUser.userId,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      roleLabel:
        updatedUser.role === 'admin'
          ? 'Campus Administrator'
          : updatedUser.role === 'staff'
          ? `${updatedUser.name} (${updatedUser.department} Technician)`
          : 'Student',
      department: updatedUser.department,
      division: updatedUser.division || 'A',
      rollNo: updatedUser.rollNo,
      year: updatedUser.year,
      hostel: updatedUser.hostel,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
    };

    return res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
