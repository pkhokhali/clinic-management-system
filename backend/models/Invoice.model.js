const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['Consultation', 'Lab Test', 'Medicine', 'Other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Khalti', 'eSewa', 'Fonepay', 'Other'],
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  transactionId: String,
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  paymentGateway: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required'],
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  payments: [paymentSchema],
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Partially Paid', 'Paid', 'Cancelled', 'Refunded'],
    default: 'Pending',
  },
  dueDate: Date,
  notes: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Calculate total payment amount
invoiceSchema.virtual('totalPaid').get(function() {
  return this.payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);
});

invoiceSchema.virtual('balance').get(function() {
  return this.total - (this.totalPaid || 0);
});

invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

invoiceSchema.index({ patient: 1, invoiceDate: -1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
