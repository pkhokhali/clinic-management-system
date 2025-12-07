const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now,
  },
  chiefComplaint: {
    type: String,
    trim: true,
  },
  historyOfPresentIllness: {
    type: String,
    trim: true,
  },
  physicalExamination: {
    type: String,
    trim: true,
  },
  diagnosis: [{
    type: String,
    trim: true,
  }],
  treatment: {
    type: String,
    trim: true,
  },
  followUp: {
    date: Date,
    notes: String,
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
  labRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabRequest',
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
  },
}, {
  timestamps: true,
});

medicalRecordSchema.index({ patient: 1, date: -1 });
medicalRecordSchema.index({ doctor: 1, date: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
