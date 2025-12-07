const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  type: {
    type: String,
    enum: ['Lab Test Billed', 'Lab Result Ready', 'Appointment Reminder', 'Payment Received', 'Other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // Can reference LabRequest, Invoice, LabResult, etc.
  },
  relatedType: {
    type: String,
    enum: ['LabRequest', 'Invoice', 'LabResult', 'Appointment', 'Other'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

