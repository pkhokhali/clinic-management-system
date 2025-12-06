const mongoose = require('mongoose');

const testParameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  unit: String,
  normalRange: String,
  description: String,
});

const labTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test name is required'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Test category is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  parameters: [testParameterSchema],
  cost: {
    type: Number,
    required: [true, 'Test cost is required'],
    min: 0,
  },
  preparation: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number, // in hours
    default: 24,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

labTestSchema.index({ name: 1 });
labTestSchema.index({ category: 1 });

module.exports = mongoose.model('LabTest', labTestSchema);
