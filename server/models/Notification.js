const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientEmail: { type: String, required: true, lowercase: true, index: true },
    recipientRole: { type: String, enum: ['student', 'staff', 'admin'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning'], default: 'info' },
    link: { type: String, default: '' },
    complaintId: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientEmail: 1, recipientRole: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
