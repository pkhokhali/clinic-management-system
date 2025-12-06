const mongoose = require('mongoose');

const labRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required'],
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required'],
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  tests: [{
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true,
    },
    notes: String,
  }],
  orderDate: {
    type: Date,
    default: Date.now,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Sample Collected', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['Routine', 'Urgent', 'Stat'],
    default: 'Routine',
  },
  instructions: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

labRequestSchema.index({ patient: 1, orderDate: -1 });
labRequestSchema.index({ doctor: 1, orderDate: -1 });
labRequestSchema.index({ status: 1 });

module.exports = mongoose.model('LabRequest', labRequestSchema);
