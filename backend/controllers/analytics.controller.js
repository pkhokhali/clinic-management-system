const Appointment = require('../models/Appointment.model');
const Invoice = require('../models/Invoice.model');
const LabRequest = require('../models/LabRequest.model');
const LabResult = require('../models/LabResult.model');

exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Appointments stats - filter by appointmentDate
    const appointmentFilter = {};
    if (startDate || endDate) {
      appointmentFilter.appointmentDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        appointmentFilter.appointmentDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        appointmentFilter.appointmentDate.$lte = end;
      }
    }
    
    const totalAppointments = await Appointment.countDocuments(appointmentFilter);
    const confirmedAppointments = await Appointment.countDocuments({ ...appointmentFilter, status: 'Confirmed' });
    const completedAppointments = await Appointment.countDocuments({ ...appointmentFilter, status: 'Completed' });

    // Revenue stats - filter by invoiceDate and include all invoices (not just paid)
    const invoiceFilter = {};
    if (startDate || endDate) {
      invoiceFilter.invoiceDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        invoiceFilter.invoiceDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        invoiceFilter.invoiceDate.$lte = end;
      }
    }
    
    // Get all invoices in date range
    const allInvoices = await Invoice.find(invoiceFilter);
    
    // Calculate total revenue from all invoices
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // Calculate paid revenue (only from paid invoices or completed payments)
    const paidRevenue = allInvoices.reduce((sum, inv) => {
      if (inv.payments && inv.payments.length > 0) {
        const paid = inv.payments
          .filter(p => p.status === 'Completed')
          .reduce((s, p) => s + (p.amount || 0), 0);
        return sum + paid;
      }
      return sum;
    }, 0);
    
    // Count paid invoices
    const paidInvoices = allInvoices.filter(inv => inv.status === 'Paid').length;

    // Lab stats - filter by orderDate
    const labRequestFilter = {};
    if (startDate || endDate) {
      labRequestFilter.orderDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        labRequestFilter.orderDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        labRequestFilter.orderDate.$lte = end;
      }
    }
    
    const totalLabRequests = await LabRequest.countDocuments(labRequestFilter);
    
    // Lab results - filter by resultDate
    const labResultFilter = {};
    if (startDate || endDate) {
      labResultFilter.resultDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        labResultFilter.resultDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        labResultFilter.resultDate.$lte = end;
      }
    }
    labResultFilter.status = 'Completed';
    const completedLabResults = await LabResult.countDocuments(labResultFilter);

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
          paid: paidRevenue,
          invoices: allInvoices.length,
          paidInvoices: paidInvoices,
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
    const query: any = {};
    
    // Filter by invoiceDate (not status, to show all invoices)
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.invoiceDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.invoiceDate.$lte = end;
      }
    }

    const invoices = await Invoice.find(query)
      .populate('patient', 'firstName lastName')
      .sort({ invoiceDate: -1 });

    // Calculate total revenue (sum of all invoice totals)
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // Calculate total paid (sum of completed payments)
    const totalPaid = invoices.reduce((sum, inv) => {
      if (inv.payments && inv.payments.length > 0) {
        const paid = inv.payments
          .filter(p => p.status === 'Completed')
          .reduce((s, p) => s + (p.amount || 0), 0);
        return sum + paid;
      }
      return sum;
    }, 0);
    
    // Calculate outstanding (total - paid)
    const outstanding = totalRevenue - totalPaid;
    
    // Count invoices by status
    const paidCount = invoices.filter(inv => inv.status === 'Paid').length;
    const pendingCount = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'Partially Paid').length;

    res.status(200).json({
      success: true,
      data: {
        invoices,
        totalRevenue,
        totalPaid,
        outstanding,
        count: invoices.length,
        paidCount,
        pendingCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching revenue report', error: error.message });
  }
};
