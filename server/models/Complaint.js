const mongoose = require('mongoose');

const timelineItemSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const remarkSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => `REM-${Date.now()}`,
    },
    author: {
      type: String,
      required: true,
    },
    authorRole: {
      type: String,
      default: 'Staff',
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Other',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      default: 'Campus Premises',
    },
    isAiDetected: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Rejected', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Verified'],
      default: 'Pending Review',
    },
    reviewNote: { type: String, default: '' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    student: {
      id: String,
      name: String,
      email: String,
      rollNo: String,
      department: String,
      avatar: String,
    },
    assignedStaff: {
      id: String,
      name: String,
      email: String,
      department: String,
      specialization: String,
      phone: String,
      avatar: String,
    },
    imageUrl: {
      type: String,
    },
    timeline: [timelineItemSchema],
    remarks: [remarkSchema],
    feedback: feedbackSchema,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
