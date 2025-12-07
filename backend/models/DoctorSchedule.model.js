const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required'],
    index: true,
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    min: 0,
    max: 6,
  },
  specificDate: {
    type: Date, // For one-time schedules on specific dates
  },
  startTime: {
    type: String, // Format: "HH:mm" (e.g., "09:00")
    required: [true, 'Start time is required'],
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates HH:mm format
  },
  endTime: {
    type: String, // Format: "HH:mm" (e.g., "17:00")
    required: [true, 'End time is required'],
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates HH:mm format
  },
  slotDuration: {
    type: Number, // Duration in minutes (default 30)
    default: 30,
    min: 5,
    max: 50,
  },
  consultationFee: {
    type: Number, // Consultation fee in local currency
    min: 0,
    default: 0,
  },
  isRecurring: {
    type: Boolean,
    default: true, // If true, repeats weekly on dayOfWeek; if false, use specificDate
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  effectiveFrom: {
    type: Date,
    default: Date.now,
  },
  effectiveUntil: {
    type: Date, // Optional end date for recurring schedules
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Ensure either dayOfWeek (for recurring) or specificDate (for one-time) is provided
doctorScheduleSchema.pre('validate', function(next) {
  if (this.isRecurring) {
    if (this.dayOfWeek === undefined || this.dayOfWeek === null) {
      return next(new Error('dayOfWeek is required for recurring schedules'));
    }
  } else {
    if (!this.specificDate) {
      return next(new Error('specificDate is required for one-time schedules'));
    }
  }
  next();
});

// Validate that endTime is after startTime
doctorScheduleSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
  }
  next();
});

// Indexes for efficient queries
doctorScheduleSchema.index({ doctor: 1, dayOfWeek: 1, isActive: 1 });
doctorScheduleSchema.index({ doctor: 1, specificDate: 1, isActive: 1 });
doctorScheduleSchema.index({ doctor: 1, isActive: 1 });

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);

