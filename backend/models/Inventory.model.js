const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Medicine', 'Lab Supplies', 'Equipment', 'Other'],
  },
  description: {
    type: String,
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['Piece', 'Box', 'Bottle', 'Pack', 'Unit', 'Other'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0,
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: 0,
  },
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: 0,
  },
  sellingPrice: {
    type: Number,
    min: 0,
  },
  expiryDate: Date,
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  location: {
    type: String,
    trim: true,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastRestocked: Date,
}, {
  timestamps: true,
});

inventorySchema.index({ itemName: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ barcode: 1 });
inventorySchema.index({ quantity: 1, reorderLevel: 1 });

// Virtual to check if low stock
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.reorderLevel;
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
