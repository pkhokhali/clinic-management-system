const mongoose = require('mongoose');

const resultValueSchema = new mongoose.Schema({
  parameterName: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
  },
  unit: String,
  normalRange: String,
  flag: {
    type: String,
    enum: ['Normal', 'High', 'Low', 'Critical'],
    default: 'Normal',
  },
  comments: String,
});

const labResultSchema = new mongoose.Schema({
  labRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabRequest',
    required: [true, 'Lab request is required'],
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest',
    required: [true, 'Lab test is required'],
  },
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
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sampleCollectionDate: Date,
  resultDate: {
    type: Date,
    default: Date.now,
  },
  resultValues: [resultValueSchema],
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Verified', 'Cancelled'],
    default: 'Pending',
  },
  comments: {
    type: String,
    trim: true,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
}, {
  timestamps: true,
});

labResultSchema.index({ patient: 1, resultDate: -1 });
labResultSchema.index({ doctor: 1, resultDate: -1 });
labResultSchema.index({ status: 1 });

module.exports = mongoose.model('LabResult', labResultSchema);
