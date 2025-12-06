const Appointment = require('../models/Appointment.model');
const Invoice = require('../models/Invoice.model');
const LabRequest = require('../models/LabRequest.model');
const LabResult = require('../models/LabResult.model');

exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Appointments stats
    const totalAppointments = await Appointment.countDocuments(dateFilter);
    const confirmedAppointments = await Appointment.countDocuments({ ...dateFilter, status: 'Confirmed' });
    const completedAppointments = await Appointment.countDocuments({ ...dateFilter, status: 'Completed' });

    // Revenue stats
    const paidInvoices = await Invoice.find({ ...dateFilter, status: 'Paid' });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Lab stats
    const totalLabRequests = await LabRequest.countDocuments(dateFilter);
    const completedLabResults = await LabResult.countDocuments({ ...dateFilter, status: 'Completed' });

    res.status(200).json({
      success: true,
      data: {
        appointments: {
          total: totalAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
        },
        revenue: {
          total: totalRevenue,
          invoices: paidInvoices.length,
        },
        lab: {
          requests: totalLabRequests,
          completed: completedLabResults,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: 'Paid' };
    
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate('patient', 'firstName lastName')
      .sort({ invoiceDate: -1 });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => {
      const paid = inv.payments
        .filter(p => p.status === 'Completed')
        .reduce((s, p) => s + p.amount, 0);
      return sum + paid;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        invoices,
        totalRevenue,
        totalPaid,
        count: invoices.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching revenue report', error: error.message });
  }
};
