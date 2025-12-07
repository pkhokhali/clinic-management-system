const mongoose = require('mongoose');

const labCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

labCategorySchema.index({ name: 1 });
labCategorySchema.index({ isActive: 1 });

module.exports = mongoose.model('LabCategory', labCategorySchema);

