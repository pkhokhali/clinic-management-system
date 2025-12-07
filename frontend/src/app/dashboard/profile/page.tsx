'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Science as ScienceIcon,
  LocalPharmacy as PrescriptionIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { User } from '@/types';

interface MedicalRecord {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  appointment?: string | any;
  date: string | Date;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string[];
  treatment?: string;
  followUp?: {
    date?: Date;
    notes?: string;
  };
}

interface LabRequest {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  tests: Array<{
    test: string | any;
    notes?: string;
  }>;
  orderDate: string | Date;
  status: 'Pending' | 'Sample Collected' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Routine' | 'Urgent' | 'Stat';
}

interface Prescription {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  medications: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity: number;
  }>;
  date: string | Date;
  status: 'Active' | 'Completed' | 'Cancelled';
}

interface Appointment {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  appointmentDate: string | Date;
  appointmentTime: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  reason?: string;
}

interface Invoice {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  patient: string | User;
  items: Array<{
    itemType: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payments?: Array<{
    amount: number;
    paymentMethod: string;
    paymentDate: Date | string;
    status: string;
    transactionId?: string;
  }>;
  status: 'Draft' | 'Pending' | 'Partially Paid' | 'Paid' | 'Cancelled' | 'Refunded';
  invoiceDate: string | Date;
  dueDate?: Date | string;
  notes?: string;
}

export default function PatientProfilePage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Patient data
  const [patientData, setPatientData] = useState<User | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Loading states
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingLabRequests, setLoadingLabRequests] = useState(false);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  
  // View dialog states
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [openRecordDialog, setOpenRecordDialog] = useState(false);
  const [selectedLabRequest, setSelectedLabRequest] = useState<LabRequest | null>(null);
  const [openLabRequestDialog, setOpenLabRequestDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  
  // Fetch patient profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      const user = response.data.data.user;
      setPatientData({
        ...user,
        id: user._id || user.id,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch medical records
  const fetchMedicalRecords = async () => {
    try {
      setLoadingRecords(true);
      const response = await api.get('/medical/records');
      const recordsList = (response.data.data.medicalRecords || []).map((record: any) => ({
        ...record,
        id: record._id || record.id,
      }));
      setMedicalRecords(recordsList);
    } catch (err: any) {
      console.error('Failed to fetch medical records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };
  
  // Fetch lab requests
  const fetchLabRequests = async () => {
    try {
      setLoadingLabRequests(true);
      const response = await api.get('/lab/requests');
      const requestsList = (response.data.data.labRequests || []).map((req: any) => ({
        ...req,
        id: req._id || req.id,
      }));
      setLabRequests(requestsList);
    } catch (err: any) {
      console.error('Failed to fetch lab requests:', err);
    } finally {
      setLoadingLabRequests(false);
    }
  };
  
  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      setLoadingPrescriptions(true);
      const response = await api.get('/medical/prescriptions');
      const prescriptionsList = (response.data.data.prescriptions || []).map((pres: any) => ({
        ...pres,
        id: pres._id || pres.id,
      }));
      setPrescriptions(prescriptionsList);
    } catch (err: any) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoadingPrescriptions(false);
    }
  };
  
  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await api.get('/appointments');
      const appointmentsList = (response.data.data.appointments || []).map((apt: any) => ({
        ...apt,
        id: apt._id || apt.id,
      }));
      setAppointments(appointmentsList);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };
  
  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const response = await api.get('/invoices');
      const invoicesList = (response.data.data.invoices || []).map((inv: any) => ({
        ...inv,
        id: inv._id || inv.id,
        payments: inv.payments || [],
      }));
      setInvoices(invoicesList);
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // View invoice details
  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      // Fetch full invoice details including payments
      const response = await api.get(`/invoices/${invoice.id || invoice._id}`);
      const fullInvoice = {
        ...response.data.data.invoice,
        id: response.data.data.invoice._id || response.data.data.invoice.id,
      };
      setSelectedInvoice(fullInvoice);
      setOpenInvoiceDialog(true);
    } catch (err: any) {
      setError('Failed to fetch invoice details');
    }
  };
  
  useEffect(() => {
    if (currentUser?.role === 'Patient') {
      fetchProfile();
      fetchMedicalRecords();
      fetchLabRequests();
      fetchPrescriptions();
      fetchAppointments();
      fetchInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);
  
  // Fetch data when tab changes
  useEffect(() => {
    if (tabValue === 0 && medicalRecords.length === 0) fetchMedicalRecords();
    if (tabValue === 1 && labRequests.length === 0) fetchLabRequests();
    if (tabValue === 2 && prescriptions.length === 0) fetchPrescriptions();
    if (tabValue === 3 && appointments.length === 0) fetchAppointments();
    if (tabValue === 4 && invoices.length === 0) fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);
  
  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'Completed':
      case 'Paid':
      case 'Confirmed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      case 'Active':
        return 'primary';
      default:
        return 'default';
    }
  };
  
  if (currentUser?.role !== 'Patient') {
    return (
      <ProtectedRoute allowedRoles={['Patient']}>
        <DashboardLayout>
          <Alert severity="error">Access denied. This page is only for patients.</Alert>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
  
  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Patient']}>
        <DashboardLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute allowedRoles={['Patient']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              My Profile
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {/* Patient Information Card */}
          {patientData && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Personal Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {patientData.firstName} {patientData.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" /> {patientData.email}
                    </Typography>
                  </Grid>
                  {patientData.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" /> {patientData.phone}
                      </Typography>
                    </Grid>
                  )}
                  {patientData.dateOfBirth && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon fontSize="small" />
                        {new Date(patientData.dateOfBirth).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                  {patientData.gender && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1">{patientData.gender}</Typography>
                    </Grid>
                  )}
                  {patientData.bloodGroup && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Blood Group</Typography>
                      <Typography variant="body1">{patientData.bloodGroup}</Typography>
                    </Grid>
                  )}
                  {patientData.address && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" />
                        {typeof patientData.address === 'string' 
                          ? patientData.address 
                          : [
                              patientData.address.street,
                              patientData.address.city,
                              patientData.address.state,
                              patientData.address.zipCode,
                              patientData.address.country
                            ].filter(Boolean).join(', ')}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {/* Tabs for different sections */}
          <Paper>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab icon={<AssignmentIcon />} iconPosition="start" label="Medical Records" />
              <Tab icon={<ScienceIcon />} iconPosition="start" label="Lab Tests" />
              <Tab icon={<PrescriptionIcon />} iconPosition="start" label="Prescriptions" />
              <Tab icon={<CalendarIcon />} iconPosition="start" label="Appointments" />
              <Tab icon={<ReceiptIcon />} iconPosition="start" label="Invoices" />
            </Tabs>
            
            {/* Medical Records Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                {loadingRecords ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : medicalRecords.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No medical records found
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Doctor</TableCell>
                          <TableCell>Chief Complaint</TableCell>
                          <TableCell>Diagnosis</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {medicalRecords.map((record) => {
                          const doctor = typeof record.doctor === 'object' ? record.doctor : null;
                          const recordDate = record.date
                            ? (typeof record.date === 'string' ? new Date(record.date) : record.date)
                            : null;
                          
                          return (
                            <TableRow key={record.id || record._id} hover>
                              <TableCell>
                                {recordDate ? recordDate.toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                              </TableCell>
                              <TableCell>{record.chiefComplaint || '-'}</TableCell>
                              <TableCell>
                                {record.diagnosis && record.diagnosis.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {record.diagnosis.slice(0, 2).map((diag, idx) => (
                                      <Chip key={idx} label={diag} size="small" />
                                    ))}
                                    {record.diagnosis.length > 2 && (
                                      <Chip label={`+${record.diagnosis.length - 2}`} size="small" />
                                    )}
                                  </Box>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedRecord(record);
                                      setOpenRecordDialog(true);
                                    }}
                                    color="primary"
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {/* Lab Tests Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                {loadingLabRequests ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : labRequests.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No lab tests found
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order Date</TableCell>
                          <TableCell>Tests</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {labRequests.map((request) => {
                          const orderDate = request.orderDate
                            ? (typeof request.orderDate === 'string' ? new Date(request.orderDate) : request.orderDate)
                            : null;
                          
                          return (
                            <TableRow key={request.id || request._id} hover>
                              <TableCell>
                                {orderDate ? orderDate.toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {request.tests.length} test(s)
                              </TableCell>
                              <TableCell>
                                <Chip label={request.priority} size="small" color={request.priority === 'Urgent' || request.priority === 'Stat' ? 'error' : 'default'} />
                              </TableCell>
                              <TableCell>
                                <Chip label={request.status} size="small" color={getStatusColor(request.status)} />
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedLabRequest(request);
                                      setOpenLabRequestDialog(true);
                                    }}
                                    color="primary"
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {/* Prescriptions Tab */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                {loadingPrescriptions ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : prescriptions.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No prescriptions found
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Doctor</TableCell>
                          <TableCell>Medications</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prescriptions.map((prescription) => {
                          const doctor = typeof prescription.doctor === 'object' ? prescription.doctor : null;
                          const prescriptionDate = prescription.date
                            ? (typeof prescription.date === 'string' ? new Date(prescription.date) : prescription.date)
                            : null;
                          
                          return (
                            <TableRow key={prescription.id || prescription._id} hover>
                              <TableCell>
                                {prescriptionDate ? prescriptionDate.toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {prescription.medications?.length || 0} medication(s)
                              </TableCell>
                              <TableCell>
                                <Chip label={prescription.status} size="small" color={getStatusColor(prescription.status)} />
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedPrescription(prescription);
                                      setOpenPrescriptionDialog(true);
                                    }}
                                    color="primary"
                                  >
                                    <VisibilityIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {/* Appointments Tab */}
            {tabValue === 3 && (
              <Box sx={{ p: 3 }}>
                {loadingAppointments ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : appointments.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No appointments found
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Doctor</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {appointments.map((appointment) => {
                          const doctor = typeof appointment.doctor === 'object' ? appointment.doctor : null;
                          const appointmentDate = appointment.appointmentDate
                            ? (typeof appointment.appointmentDate === 'string' ? new Date(appointment.appointmentDate) : appointment.appointmentDate)
                            : null;
                          
                          return (
                            <TableRow key={appointment.id || appointment._id} hover>
                              <TableCell>
                                {appointmentDate ? appointmentDate.toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccessTimeIcon fontSize="small" />
                                  {appointment.appointmentTime}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                              </TableCell>
                              <TableCell>{appointment.reason || '-'}</TableCell>
                              <TableCell>
                                <Chip label={appointment.status} size="small" color={getStatusColor(appointment.status)} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {/* Invoices Tab */}
            {tabValue === 4 && (
              <Box sx={{ p: 3 }}>
                {loadingInvoices ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : invoices.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No invoices found
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice #</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Total Amount</TableCell>
                          <TableCell>Clear Amount (Paid)</TableCell>
                          <TableCell>Outstanding Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoices.map((invoice) => {
                          const invoiceDate = invoice.invoiceDate
                            ? (typeof invoice.invoiceDate === 'string' ? new Date(invoice.invoiceDate) : invoice.invoiceDate)
                            : null;
                          
                          const totalPaid = invoice.payments
                            ? invoice.payments.filter((p: any) => p.status === 'Completed').reduce((sum: number, p: any) => sum + p.amount, 0)
                            : 0;
                          const outstandingAmount = invoice.total - totalPaid;
                          
                          return (
                            <TableRow key={invoice.id || invoice._id} hover>
                              <TableCell>{invoice.invoiceNumber}</TableCell>
                              <TableCell>
                                {invoiceDate ? invoiceDate.toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  Rs. {invoice.total?.toFixed(2) || '0.00'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: 'success.main' }}>
                                  Rs. {totalPaid.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: outstandingAmount > 0 ? 'error.main' : 'success.main', fontWeight: 'medium' }}>
                                  Rs. {outstandingAmount.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={invoice.status} size="small" color={getStatusColor(invoice.status)} />
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
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Paper>
          
          {/* View Medical Record Dialog */}
          <Dialog open={openRecordDialog} onClose={() => setOpenRecordDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogContent>
              {selectedRecord && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                      <Typography variant="body1">
                        {selectedRecord.date
                          ? (typeof selectedRecord.date === 'string' ? new Date(selectedRecord.date).toLocaleDateString() : selectedRecord.date.toLocaleDateString())
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Doctor</Typography>
                      <Typography variant="body1">
                        {typeof selectedRecord.doctor === 'object' ? `Dr. ${selectedRecord.doctor.firstName} ${selectedRecord.doctor.lastName}` : 'N/A'}
                      </Typography>
                    </Grid>
                    {selectedRecord.chiefComplaint && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Chief Complaint</Typography>
                        <Typography variant="body1">{selectedRecord.chiefComplaint}</Typography>
                      </Grid>
                    )}
                    {selectedRecord.diagnosis && selectedRecord.diagnosis.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Diagnosis</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {selectedRecord.diagnosis.map((diag, idx) => (
                            <Chip key={idx} label={diag} />
                          ))}
                        </Box>
                      </Grid>
                    )}
                    {selectedRecord.treatment && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Treatment</Typography>
                        <Typography variant="body1">{selectedRecord.treatment}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRecordDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
          
          {/* View Lab Request Dialog */}
          <Dialog open={openLabRequestDialog} onClose={() => setOpenLabRequestDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Lab Test Details</DialogTitle>
            <DialogContent>
              {selectedLabRequest && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
                      <Typography variant="body1">
                        {selectedLabRequest.orderDate
                          ? (typeof selectedLabRequest.orderDate === 'string' ? new Date(selectedLabRequest.orderDate).toLocaleDateString() : selectedLabRequest.orderDate.toLocaleDateString())
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip label={selectedLabRequest.status} color={getStatusColor(selectedLabRequest.status)} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Tests</Typography>
                      <Box sx={{ mt: 1 }}>
                        {selectedLabRequest.tests.map((testItem, idx) => {
                          const test = typeof testItem.test === 'object' ? testItem.test : null;
                          return (
                            <Chip
                              key={idx}
                              label={test ? test.name : 'N/A'}
                              sx={{ mr: 1, mb: 1 }}
                            />
                          );
                        })}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenLabRequestDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* View Invoice Dialog */}
          <Dialog open={openInvoiceDialog} onClose={() => setOpenInvoiceDialog(false)} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogContent>
              {selectedInvoice && (() => {
                const totalPaid = selectedInvoice.payments
                  ? selectedInvoice.payments.filter((p: any) => p.status === 'Completed').reduce((sum: number, p: any) => sum + p.amount, 0)
                  : 0;
                const outstandingAmount = selectedInvoice.total - totalPaid;
                
                return (
                  <Box sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Invoice Number</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {selectedInvoice.invoiceNumber}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Invoice Date</Typography>
                        <Typography variant="body1">
                          {selectedInvoice.invoiceDate
                            ? (typeof selectedInvoice.invoiceDate === 'string'
                                ? new Date(selectedInvoice.invoiceDate).toLocaleDateString()
                                : selectedInvoice.invoiceDate.toLocaleDateString())
                            : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                        <Chip
                          label={selectedInvoice.status}
                          size="small"
                          color={getStatusColor(selectedInvoice.status)}
                        />
                      </Grid>
                      {selectedInvoice.dueDate && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                          <Typography variant="body1">
                            {typeof selectedInvoice.dueDate === 'string'
                              ? new Date(selectedInvoice.dueDate).toLocaleDateString()
                              : selectedInvoice.dueDate.toLocaleDateString()}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2 }}>Invoice Items</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Quantity</TableCell>
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
                        <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(selectedInvoice.total)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Clear Amount (Paid)</Typography>
                        <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {formatCurrency(totalPaid)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Outstanding Amount</Typography>
                        <Typography variant="h6" sx={{ color: outstandingAmount > 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                          {formatCurrency(outstandingAmount)}
                        </Typography>
                      </Grid>
                      {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                        <>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" sx={{ mb: 2 }}>Payment History</Typography>
                            {selectedInvoice.payments.map((payment: any, index: number) => (
                              <Card key={index} sx={{ mb: 1 }}>
                                <CardContent>
                                  <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                      <Typography variant="body2" color="text.secondary">Amount</Typography>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {formatCurrency(payment.amount)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                      <Typography variant="body2" color="text.secondary">Method</Typography>
                                      <Typography variant="body1">{payment.paymentMethod}</Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                      <Typography variant="body2" color="text.secondary">Date</Typography>
                                      <Typography variant="body1">
                                        {payment.paymentDate
                                          ? (typeof payment.paymentDate === 'string'
                                              ? new Date(payment.paymentDate).toLocaleDateString()
                                              : new Date(payment.paymentDate).toLocaleDateString())
                                          : 'N/A'}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                      <Typography variant="body2" color="text.secondary">Status</Typography>
                                      <Chip
                                        label={payment.status}
                                        size="small"
                                        color={payment.status === 'Completed' ? 'success' : 'default'}
                                      />
                                    </Grid>
                                    {payment.transactionId && (
                                      <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                                        <Typography variant="body2">{payment.transactionId}</Typography>
                                      </Grid>
                                    )}
                                  </Grid>
                                </CardContent>
                              </Card>
                            ))}
                          </Grid>
                        </>
                      )}
                      {selectedInvoice.notes && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="body2" color="text.secondary">Notes</Typography>
                          <Typography variant="body1">{selectedInvoice.notes}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                );
              })()}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenInvoiceDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
          
          {/* View Prescription Dialog */}
          <Dialog open={openPrescriptionDialog} onClose={() => setOpenPrescriptionDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogContent>
              {selectedPrescription && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                      <Typography variant="body1">
                        {selectedPrescription.date
                          ? (typeof selectedPrescription.date === 'string' ? new Date(selectedPrescription.date).toLocaleDateString() : selectedPrescription.date.toLocaleDateString())
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip label={selectedPrescription.status} color={getStatusColor(selectedPrescription.status)} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Medications</Typography>
                      <Box sx={{ mt: 1 }}>
                        {selectedPrescription.medications?.map((med, idx) => (
                          <Paper key={idx} sx={{ p: 2, mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {med.medicineName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}
                            </Typography>
                            {med.instructions && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Instructions: {med.instructions}
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenPrescriptionDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

