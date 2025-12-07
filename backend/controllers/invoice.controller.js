const Invoice = require('../models/Invoice.model');
const Appointment = require('../models/Appointment.model');
const LabRequest = require('../models/LabRequest.model');
const User = require('../models/User.model');
const { createNotification } = require('./notification.controller');

// Generate invoice number
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  const number = String(count + 1).padStart(6, '0');
  return `INV-${year}-${number}`;
};

exports.createInvoice = async (req, res) => {
  try {
    const { patient, items, subtotal, discount, tax, notes, appointment, status: invoiceStatus } = req.body;
    
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
      status: invoiceStatus || 'Pending',
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('appointment');

    // If invoice contains lab tests, mark lab requests as billed and send notifications
    const hasLabTests = items && items.some(item => item.itemType === 'Lab Test');
    
    if (hasLabTests) {
      // Process lab test notifications asynchronously (don't block response)
      // This marks lab requests as billed and notifies lab technicians
      processLabTestNotifications(invoice, items).catch(err => {
        console.error('Error processing lab test notifications:', err);
      });
    }

    res.status(201).json({ success: true, data: { invoice: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating invoice', error: error.message });
  }
};

// Helper function to process lab test notifications
async function processLabTestNotifications(invoice, items) {
  try {
    const labTestItems = items.filter(item => item.itemType === 'Lab Test');
    const labRequestIds = labTestItems
      .map(item => item.referenceId)
      .filter(id => id);

    if (labRequestIds.length > 0) {
      // Use $in with string IDs or ObjectIds
      const labRequests = await LabRequest.find({ 
        $or: [
          { _id: { $in: labRequestIds } },
          { _id: { $in: labRequestIds.map(id => id.toString()) } }
        ]
      })
        .populate('patient', 'firstName lastName');
      
      for (const labRequest of labRequests) {
        if (!labRequest.isBilled) {
          labRequest.isBilled = true;
          labRequest.billedAt = new Date();
          labRequest.invoice = invoice._id;
          await labRequest.save();

          const labTechnicians = await User.find({ role: 'Lab Technician' });
          const patient = typeof labRequest.patient === 'object' 
            ? labRequest.patient 
            : await User.findById(labRequest.patient);
          
          for (const technician of labTechnicians) {
            await createNotification(
              technician._id,
              'Lab Test Billed',
              'New Lab Test Billed',
              `Lab test for ${patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'} has been billed and is ready for processing.`,
              labRequest._id,
              'LabRequest'
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in processLabTestNotifications:', error);
  }
}

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

    // Check if invoice contains lab tests and payment is completed
    const hasLabTests = invoice.items.some(item => item.itemType === 'Lab Test');
    const isPaid = invoice.status === 'Paid' || invoice.status === 'Partially Paid';

    // If lab tests are billed and payment is made, process notifications
    if (hasLabTests && isPaid) {
      processLabTestNotifications(invoice, invoice.items).catch(err => {
        console.error('Error processing lab test notifications:', err);
      });
    }

    res.status(200).json({ success: true, data: { invoice } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding payment', error: error.message });
  }
};
