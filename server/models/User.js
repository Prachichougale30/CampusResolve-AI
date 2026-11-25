const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'staff', 'admin'],
      default: 'student',
    },
    userId: {
      type: String,
      required: [true, 'User ID / Registration ID is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    division: {
      type: String,
      default: 'A',
      trim: true,
    },
    rollNo: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      default: '1st Year',
    },
    hostel: {
      type: String,
      default: 'Hostel Block A',
    },
    phone: {
      type: String,
      default: '+91 99999 00000',
    },
    avatar: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    status: {
      type: String,
      default: 'active',
    },
    specialization: {
      type: String,
    },
    activeComplaints: {
      type: Number,
      default: 0,
    },
    completedComplaints: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);

