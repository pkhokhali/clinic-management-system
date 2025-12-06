const Invoice = require('../models/Invoice.model');
const Appointment = require('../models/Appointment.model');

// Generate invoice number
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  const number = String(count + 1).padStart(6, '0');
  return `INV-${year}-${number}`;
};

exports.createInvoice = async (req, res) => {
  try {
    const { patient, items, subtotal, discount, tax, notes, appointment } = req.body;
    
    const total = subtotal - (discount || 0) + (tax || 0);
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      patient,
      appointment,
      items,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      total,
      notes,
      createdBy: req.user.id,
      status: 'Pending',
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('appointment');

    res.status(201).json({ success: true, data: { invoice: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating invoice', error: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const { status, patient, startDate, endDate } = req.query;
    const query = {};
    
    if (req.user.role === 'Patient') {
      query.patient = req.user.id;
    } else if (patient) {
      query.patient = patient;
    }
    
    if (status) query.status = status;
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('appointment')
      .sort({ invoiceDate: -1 });

    res.status(200).json({ success: true, count: invoices.length, data: { invoices } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoices', error: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone address')
      .populate('appointment')
      .populate('createdBy', 'firstName lastName');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: { invoice } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoice', error: error.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, paymentGateway, gatewayResponse } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.payments.push({
      amount,
      paymentMethod,
      transactionId,
      paymentGateway,
      gatewayResponse,
      status: 'Completed',
    });

    // Update invoice status
    const totalPaid = invoice.payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= invoice.total) {
      invoice.status = 'Paid';
    } else if (totalPaid > 0) {
      invoice.status = 'Partially Paid';
    }

    await invoice.save();

    res.status(200).json({ success: true, data: { invoice } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding payment', error: error.message });
  }
};
