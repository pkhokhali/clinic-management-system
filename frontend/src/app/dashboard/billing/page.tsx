'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { User } from '@/types';

interface InvoiceItem {
  itemType: 'Consultation' | 'Lab Test' | 'Medicine' | 'Other';
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  referenceId?: string;
}

interface Invoice {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  patient: string | User;
  appointment?: string | any;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payments: Array<{
    amount: number;
    paymentMethod: string;
    paymentDate: Date;
    status: string;
    transactionId?: string;
  }>;
  status: 'Draft' | 'Pending' | 'Partially Paid' | 'Paid' | 'Cancelled' | 'Refunded';
  invoiceDate: string | Date;
  dueDate?: Date;
  notes?: string;
}

export default function BillingPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  
  // Dialog states
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openInvoiceViewDialog, setOpenInvoiceViewDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Invoice form
  const [invoiceFormData, setInvoiceFormData] = useState({
    patient: '',
    appointment: '',
    items: [] as InvoiceItem[],
    discount: 0,
    tax: 0,
    notes: '',
  });
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState<InvoiceItem>({
    itemType: 'Consultation',
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
  });
  
  // Payment form
  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    paymentMethod: 'Cash' as 'Cash' | 'Card' | 'Khalti' | 'eSewa' | 'Fonepay' | 'Other',
    transactionId: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (patientFilter !== 'all') {
        params.append('patient', patientFilter);
      }
      
      const response = await api.get(`/invoices?${params.toString()}`);
      const invoicesList = (response.data.data.invoices || []).map((inv: any) => ({
        ...inv,
        id: inv._id || inv.id,
      }));
      setInvoices(invoicesList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const response = await api.get('/users?role=Patient');
      const patientsList = (response.data.data.users || []).map((user: any) => ({
        ...user,
        id: user._id || user.id,
      }));
      setPatients(patientsList);
    } catch (err: any) {
      console.error('Failed to fetch patients:', err);
    }
  };

  // Fetch appointments for a patient
  const fetchAppointments = async (patientId: string) => {
    try {
      const response = await api.get(`/appointments?patient=${patientId}`);
      const appointmentsList = (response.data.data.appointments || []).map((apt: any) => ({
        ...apt,
        id: apt._id || apt.id,
      }));
      setAppointments(appointmentsList);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    if (currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist') {
      fetchPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, patientFilter]);

  useEffect(() => {
    if (invoiceFormData.patient) {
      fetchAppointments(invoiceFormData.patient);
    } else {
      setAppointments([]);
    }
  }, [invoiceFormData.patient]);

  // Auto-populate consultation details when consultation type is selected with appointment
  useEffect(() => {
    const autoPopulateConsultation = async () => {
      if (
        currentItem.itemType === 'Consultation' &&
        invoiceFormData.appointment &&
        invoiceFormData.patient
      ) {
        try {
          // Find the selected appointment
          const selectedAppointment = appointments.find(
            apt => apt.id === invoiceFormData.appointment
          );
          
          if (selectedAppointment) {
            const doctor = typeof selectedAppointment.doctor === 'object' 
              ? selectedAppointment.doctor 
              : null;
            
            if (doctor) {
              const doctorId = doctor.id || (doctor as any)._id;
              
              // Fetch consultation fee
              const feeResponse = await api.get(`/schedules/consultation-fee/${doctorId}`);
              const consultationFee = feeResponse.data.data.consultationFee || 0;
              
              // Auto-populate description and unit price
              const doctorName = `${doctor.firstName} ${doctor.lastName}`;
              setCurrentItem(prev => ({
                ...prev,
                description: `OPD Charge - Dr. ${doctorName}`,
                unitPrice: consultationFee,
              }));
            }
          }
        } catch (err: any) {
          console.error('Failed to fetch consultation fee:', err);
          // If appointment is selected but fee fetch fails, still set description
          const selectedAppointment = appointments.find(
            apt => apt.id === invoiceFormData.appointment
          );
          if (selectedAppointment) {
            const doctor = typeof selectedAppointment.doctor === 'object' 
              ? selectedAppointment.doctor 
              : null;
            if (doctor) {
              const doctorName = `${doctor.firstName} ${doctor.lastName}`;
              setCurrentItem(prev => ({
                ...prev,
                description: `OPD Charge - Dr. ${doctorName}`,
                unitPrice: prev.unitPrice || 0,
              }));
            }
          }
        }
      }
    };

    autoPopulateConsultation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem.itemType, invoiceFormData.appointment, appointments]);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    const patient = typeof invoice.patient === 'object' ? invoice.patient : null;
    
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
      invoice.items?.some(item => item.description.toLowerCase().includes(searchLower))
    );
  });

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = invoiceFormData.items.reduce((sum, item) => sum + item.total, 0);
    const discount = invoiceFormData.discount || 0;
    const tax = invoiceFormData.tax || 0;
    const total = subtotal - discount + tax;
    
    return { subtotal, discount, tax, total };
  };

  // Handle item calculation
  useEffect(() => {
    const total = currentItem.quantity * currentItem.unitPrice;
    setCurrentItem((prev) => ({ ...prev, total }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem.quantity, currentItem.unitPrice]);

  // Add item
  const handleAddItem = () => {
    if (currentItem.description && currentItem.quantity > 0 && currentItem.unitPrice > 0) {
      setInvoiceFormData({
        ...invoiceFormData,
        items: [...invoiceFormData.items, { ...currentItem }],
      });
      setCurrentItem({
        itemType: 'Consultation',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      });
    }
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setInvoiceFormData({
      ...invoiceFormData,
      items: invoiceFormData.items.filter((_, i) => i !== index),
    });
  };

  // Handle invoice submission
  const handleInvoiceSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (invoiceFormData.items.length === 0) {
        setError('Please add at least one item to the invoice');
        setSubmitting(false);
        return;
      }
      
      const { subtotal, discount, tax, total } = calculateTotals();
      
      const payload: any = {
        patient: invoiceFormData.patient,
        items: invoiceFormData.items,
        subtotal,
        discount,
        tax,
        notes: invoiceFormData.notes,
      };
      
      if (invoiceFormData.appointment) {
        payload.appointment = invoiceFormData.appointment;
      }
      
      await api.post('/invoices', payload);
      setSuccess('Invoice created successfully!');
      setOpenInvoiceDialog(false);
      resetInvoiceForm();
      fetchInvoices();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!selectedInvoice) return;
    
    try {
      setSubmittingPayment(true);
      setError(null);
      
      // Calculate balance from the selected invoice, not from the form
      const totalPaid = selectedInvoice.payments
        ? selectedInvoice.payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0)
        : 0;
      const balance = selectedInvoice.total - totalPaid;
      
      if (paymentFormData.amount <= 0) {
        setError('Payment amount must be greater than 0');
        setSubmittingPayment(false);
        return;
      }
      
      if (paymentFormData.amount > balance) {
        setError(`Payment amount cannot exceed the balance of ${formatCurrency(balance)}`);
        setSubmittingPayment(false);
        return;
      }
      
      await api.post(`/invoices/${selectedInvoice.id || selectedInvoice._id}/payment`, paymentFormData);
      setSuccess('Payment added successfully!');
      setOpenPaymentDialog(false);
      setPaymentFormData({
        amount: 0,
        paymentMethod: 'Cash',
        transactionId: '',
      });
      setError(null); // Clear any error when closing
      fetchInvoices();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // View invoice
  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice.id || invoice._id}`);
      setSelectedInvoice(response.data.data.invoice);
      setOpenInvoiceViewDialog(true);
    } catch (err: any) {
      setError('Failed to fetch invoice details');
    }
  };

  // Add payment
  const handleAddPayment = async (invoice: Invoice) => {
    try {
      setError(null); // Clear any previous errors
      // Fetch the latest invoice data to ensure we have current payment information
      const response = await api.get(`/invoices/${invoice.id || invoice._id}`);
      const latestInvoice = {
        ...response.data.data.invoice,
        id: response.data.data.invoice._id || response.data.data.invoice.id,
      };
      setSelectedInvoice(latestInvoice);
      const totalPaid = latestInvoice.payments
        ? latestInvoice.payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0)
        : 0;
      const balance = latestInvoice.total - totalPaid;
      setPaymentFormData({
        amount: balance > 0 ? balance : 0,
        paymentMethod: 'Cash',
        transactionId: '',
      });
      setOpenPaymentDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice details');
    }
  };

  // Reset form
  const resetInvoiceForm = () => {
    setInvoiceFormData({
      patient: '',
      appointment: '',
      items: [],
      discount: 0,
      tax: 0,
      notes: '',
    });
    setCurrentItem({
      itemType: 'Consultation',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'Draft': 'default',
      'Pending': 'warning',
      'Partially Paid': 'primary',
      'Paid': 'success',
      'Cancelled': 'error',
      'Refunded': 'error',
    };
    return colors[status] || 'default';
  };

  const canCreate = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist';
  const { subtotal, discount, tax, total } = calculateTotals();

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Receptionist']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Billing & Invoices
            </Typography>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetInvoiceForm();
                  setOpenInvoiceDialog(true);
                }}
              >
                Create Invoice
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Invoices
                      </Typography>
                      <Typography variant="h4">{invoices.length}</Typography>
                    </Box>
                    <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Pending
                      </Typography>
                      <Typography variant="h4">
                        {invoices.filter(inv => inv.status === 'Pending').length}
                      </Typography>
                    </Box>
                    <ReceiptIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Paid
                      </Typography>
                      <Typography variant="h4">
                        {invoices.filter(inv => inv.status === 'Paid').length}
                      </Typography>
                    </Box>
                    <PaymentIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Revenue
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(
                          invoices
                            .filter(inv => inv.status === 'Paid')
                            .reduce((sum, inv) => sum + inv.total, 0)
                        )}
                      </Typography>
                    </Box>
                    <PaymentIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search by invoice number or patient"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, minWidth: 300 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Filter by Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Patient</InputLabel>
                <Select
                  value={patientFilter}
                  label="Filter by Patient"
                  onChange={(e) => setPatientFilter(e.target.value)}
                >
                  <MenuItem value="all">All Patients</MenuItem>
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Invoices Table */}
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredInvoices.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No invoices found</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvoices.map((invoice) => {
                    const patient = typeof invoice.patient === 'object' ? invoice.patient : null;
                    const invoiceDate = invoice.invoiceDate
                      ? (typeof invoice.invoiceDate === 'string' ? new Date(invoice.invoiceDate) : invoice.invoiceDate)
                      : null;
                    const totalPaid = invoice.payments
                      ? invoice.payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0)
                      : 0;
                    const balance = invoice.total - totalPaid;

                    return (
                      <TableRow key={invoice.id || invoice._id} hover>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {invoiceDate ? invoiceDate.toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>{invoice.items?.length || 0} item(s)</TableCell>
                        <TableCell>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewInvoice(invoice)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && balance > 0 && (
                            <Tooltip title="Add Payment">
                              <IconButton
                                size="small"
                                onClick={() => handleAddPayment(invoice)}
                                color="success"
                              >
                                <PaymentIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* Create Invoice Dialog */}
          {canCreate && (
            <Dialog open={openInvoiceDialog} onClose={() => { setOpenInvoiceDialog(false); resetInvoiceForm(); }} maxWidth="md" fullWidth scroll="paper">
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Patient</InputLabel>
                    <Select
                      value={invoiceFormData.patient}
                      label="Patient"
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, patient: e.target.value, appointment: '' })}
                    >
                      {patients.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} ({patient.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Appointment (Optional)</InputLabel>
                    <Select
                      value={invoiceFormData.appointment}
                      label="Appointment (Optional)"
                      onChange={(e) => {
                        const appointmentId = e.target.value;
                        setInvoiceFormData({ ...invoiceFormData, appointment: appointmentId });
                        // If consultation is selected, trigger auto-populate
                        if (currentItem.itemType === 'Consultation' && appointmentId) {
                          // The useEffect will handle auto-population
                        } else if (currentItem.itemType === 'Consultation' && !appointmentId) {
                          // Clear description and price if appointment is removed
                          setCurrentItem(prev => ({
                            ...prev,
                            description: '',
                            unitPrice: 0,
                          }));
                        }
                      }}
                      disabled={!invoiceFormData.patient}
                    >
                      <MenuItem value="">None</MenuItem>
                      {appointments.map((apt) => (
                        <MenuItem key={apt.id} value={apt.id}>
                          {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Divider />
                  <Typography variant="h6">Invoice Items</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Item Type</InputLabel>
                        <Select
                          value={currentItem.itemType}
                          label="Item Type"
                          onChange={(e) => {
                            const newType = e.target.value as typeof currentItem.itemType;
                            // Reset description and price when changing type (except Consultation with appointment)
                            if (newType !== 'Consultation' || !invoiceFormData.appointment) {
                              setCurrentItem({ 
                                ...currentItem, 
                                itemType: newType,
                                description: '',
                                unitPrice: 0,
                              });
                            } else {
                              setCurrentItem({ ...currentItem, itemType: newType });
                            }
                          }}
                        >
                          <MenuItem value="Consultation">Consultation</MenuItem>
                          <MenuItem value="Lab Test">Lab Test</MenuItem>
                          <MenuItem value="Medicine">Medicine</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="Description"
                        value={currentItem.description}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                        fullWidth
                        size="small"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={currentItem.quantity}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                        fullWidth
                        size="small"
                        inputProps={{ min: 1 }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Unit Price"
                        type="number"
                        value={currentItem.unitPrice}
                        onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                        fullWidth
                        size="small"
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Total"
                        value={formatCurrency(currentItem.total)}
                        fullWidth
                        size="small"
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        onClick={handleAddItem}
                        disabled={!currentItem.description || currentItem.quantity <= 0 || currentItem.unitPrice <= 0}
                      >
                        Add Item
                      </Button>
                    </Grid>
                  </Grid>
                  {invoiceFormData.items.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Items Added:</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Type</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Qty</TableCell>
                              <TableCell>Unit Price</TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {invoiceFormData.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.itemType}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell>{formatCurrency(item.total)}</TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveItem(index)}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                          <Typography variant="h6">{formatCurrency(subtotal)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Discount"
                            type="number"
                            value={invoiceFormData.discount}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, discount: parseFloat(e.target.value) || 0 })}
                            fullWidth
                            size="small"
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Tax"
                            type="number"
                            value={invoiceFormData.tax}
                            onChange={(e) => setInvoiceFormData({ ...invoiceFormData, tax: parseFloat(e.target.value) || 0 })}
                            fullWidth
                            size="small"
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Total</Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(total)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  <TextField
                    label="Notes (Optional)"
                    value={invoiceFormData.notes}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, notes: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenInvoiceDialog(false); resetInvoiceForm(); }} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInvoiceSubmit}
                  variant="contained"
                  disabled={submitting || !invoiceFormData.patient || invoiceFormData.items.length === 0}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Create Invoice'}
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* View Invoice Dialog */}
          <Dialog open={openInvoiceViewDialog} onClose={() => setOpenInvoiceViewDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
            <DialogContent>
              {selectedInvoice && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
                      <Typography variant="body1">
                        {typeof selectedInvoice.patient === 'object'
                          ? `${selectedInvoice.patient.firstName} ${selectedInvoice.patient.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Invoice Date</Typography>
                      <Typography variant="body1">
                        {selectedInvoice.invoiceDate
                          ? new Date(selectedInvoice.invoiceDate).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedInvoice.status}
                        color={getStatusColor(selectedInvoice.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Items</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Type</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Qty</TableCell>
                              <TableCell>Unit Price</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedInvoice.items?.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.itemType}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body1">{formatCurrency(selectedInvoice.subtotal)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Discount</Typography>
                      <Typography variant="body1">{formatCurrency(selectedInvoice.discount || 0)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Tax</Typography>
                      <Typography variant="body1">{formatCurrency(selectedInvoice.tax || 0)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Total</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(selectedInvoice.total)}
                      </Typography>
                    </Grid>
                    {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="h6" sx={{ mb: 1 }}>Payments</Typography>
                          {selectedInvoice.payments.map((payment, index) => (
                            <Card key={index} sx={{ mb: 1 }}>
                              <CardContent>
                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Amount</Typography>
                                    <Typography variant="body1">{formatCurrency(payment.amount)}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Method</Typography>
                                    <Typography variant="body1">{payment.paymentMethod}</Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Date</Typography>
                                    <Typography variant="body1">
                                      {new Date(payment.paymentDate).toLocaleDateString()}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Status</Typography>
                                    <Chip
                                      label={payment.status}
                                      color={payment.status === 'Completed' ? 'success' : 'default'}
                                      size="small"
                                    />
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          ))}
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Total Paid</Typography>
                          <Typography variant="h6">
                            {formatCurrency(
                              selectedInvoice.payments
                                .filter(p => p.status === 'Completed')
                                .reduce((sum, p) => sum + p.amount, 0)
                            )}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Balance</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(
                              selectedInvoice.total -
                              selectedInvoice.payments
                                .filter(p => p.status === 'Completed')
                                .reduce((sum, p) => sum + p.amount, 0)
                            )}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    {selectedInvoice.notes && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Notes</Typography>
                        <Typography variant="body1">{selectedInvoice.notes}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenInvoiceViewDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Add Payment Dialog */}
          <Dialog open={openPaymentDialog} onClose={() => { setOpenPaymentDialog(false); setError(null); }} maxWidth="sm" fullWidth>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              {selectedInvoice && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Invoice Total</Typography>
                      <Typography variant="h6">{formatCurrency(selectedInvoice.total)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Total Paid</Typography>
                      <Typography variant="body1">
                        {formatCurrency(
                          selectedInvoice.payments
                            ? selectedInvoice.payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0)
                            : 0
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Balance</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {formatCurrency(
                          selectedInvoice.total -
                          (selectedInvoice.payments
                            ? selectedInvoice.payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0)
                            : 0)
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Amount"
                        type="number"
                        value={paymentFormData.amount}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: parseFloat(e.target.value) || 0 })}
                        fullWidth
                        required
                        inputProps={{ min: 0, step: 0.01, max: selectedInvoice.total - (selectedInvoice.payments ? selectedInvoice.payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0) : 0) }}
                        helperText={`Maximum: ${formatCurrency(selectedInvoice.total - (selectedInvoice.payments ? selectedInvoice.payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0) : 0))}`}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          value={paymentFormData.paymentMethod}
                          label="Payment Method"
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value as typeof paymentFormData.paymentMethod })}
                        >
                          <MenuItem value="Cash">Cash</MenuItem>
                          <MenuItem value="Card">Card</MenuItem>
                          <MenuItem value="Khalti">Khalti</MenuItem>
                          <MenuItem value="eSewa">eSewa</MenuItem>
                          <MenuItem value="Fonepay">Fonepay</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Transaction ID (Optional)"
                        value={paymentFormData.transactionId}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, transactionId: e.target.value })}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenPaymentDialog(false)} disabled={submittingPayment}>
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                variant="contained"
                disabled={
                  submittingPayment ||
                  paymentFormData.amount <= 0 ||
                  (selectedInvoice ? paymentFormData.amount > (selectedInvoice.total - (selectedInvoice.payments ? selectedInvoice.payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0) : 0)) : false)
                }
              >
                {submittingPayment ? <CircularProgress size={24} /> : 'Add Payment'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
