'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Science as ScienceIcon,
  LocalPharmacy as PrescriptionIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';

export default function PatientHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.id as string;
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState(0);
  const [patientHistory, setPatientHistory] = useState({
    medicalRecords: [] as any[],
    appointments: [] as any[],
    labRequests: [] as any[],
    prescriptions: [] as any[],
    invoices: [] as any[],
  });
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch patient details
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check authorization - Patients can only view their own history
        if (currentUser?.role === 'Patient' && currentUser?.id !== patientId) {
          setError('You are not authorized to view this patient history');
          setLoading(false);
          return;
        }

        const response = await api.get(`/users/${patientId}`);
        setPatient(response.data.data.user);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch patient details');
      } finally {
        setLoading(false);
      }
    };

    if (patientId && currentUser) {
      fetchPatient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  // Fetch patient history
  useEffect(() => {
    const fetchPatientHistory = async () => {
      if (!patientId) return;
      
      try {
        setLoadingHistory(true);
        const [recordsRes, appointmentsRes, labRequestsRes, prescriptionsRes, invoicesRes] = await Promise.all([
          api.get(`/medical/records?patient=${patientId}`).catch(() => ({ data: { data: { medicalRecords: [] } } })),
          api.get(`/appointments?patient=${patientId}`).catch(() => ({ data: { data: { appointments: [] } } })),
          api.get(`/lab/requests?patient=${patientId}`).catch(() => ({ data: { data: { labRequests: [] } } })),
          api.get(`/medical/prescriptions?patient=${patientId}`).catch(() => ({ data: { data: { prescriptions: [] } } })),
          api.get(`/invoices?patient=${patientId}`).catch(() => ({ data: { data: { invoices: [] } } })),
        ]);

        setPatientHistory({
          medicalRecords: (recordsRes.data.data.medicalRecords || []).map((r: any) => ({
            ...r,
            id: r._id || r.id,
          })),
          appointments: (appointmentsRes.data.data.appointments || []).map((a: any) => ({
            ...a,
            id: a._id || a.id,
          })),
          labRequests: (labRequestsRes.data.data.labRequests || []).map((lr: any) => ({
            ...lr,
            id: lr._id || lr.id,
          })),
          prescriptions: (prescriptionsRes.data.data.prescriptions || []).map((p: any) => ({
            ...p,
            id: p._id || p.id,
          })),
          invoices: (invoicesRes.data.data.invoices || []).map((i: any) => ({
            ...i,
            id: i._id || i.id,
          })),
        });
      } catch (err: any) {
        console.error('Failed to fetch patient history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (patientId) {
      fetchPatientHistory();
    }
  }, [patientId]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  // Get status color
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' => {
    switch (status) {
      case 'Completed':
      case 'Paid':
      case 'Active':
        return 'success';
      case 'Pending':
      case 'Scheduled':
        return 'warning';
      case 'Cancelled':
      case 'Inactive':
        return 'error';
      case 'Confirmed':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Calculate age
  const calculateAge = (dateOfBirth: string | Date | undefined): number | null => {
    if (!dateOfBirth) return null;
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Patient']}>
        <DashboardLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !patient) {
    return (
      <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Patient']}>
        <DashboardLayout>
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || 'Patient not found'}
            </Alert>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton onClick={() => router.back()}>
                <ArrowBackIcon />
              </IconButton>
            </Box>
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Patient']}>
      <DashboardLayout>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <IconButton onClick={() => router.push('/dashboard/patients')}>
              <ArrowBackIcon />
            </IconButton>
            <HistoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Patient History
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {patient.firstName} {patient.lastName}
              </Typography>
            </Box>
          </Box>

          {/* Patient Basic Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Patient Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {patient.firstName} {patient.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">
                    <EmailIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                    {patient.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">
                    <PhoneIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                    {patient.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1">
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Age</Typography>
                  <Typography variant="body1">
                    {calculateAge(patient.dateOfBirth) !== null
                      ? `${calculateAge(patient.dateOfBirth)} years`
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Gender</Typography>
                  <Typography variant="body1">{patient.gender || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Blood Group</Typography>
                  <Typography variant="body1">
                    <Chip
                      label={patient.bloodGroup || 'N/A'}
                      color="error"
                      size="small"
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={patient.isActive !== false ? 'Active' : 'Inactive'}
                    color={patient.isActive !== false ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* History Tabs */}
          <Paper>
            <Tabs value={historyTab} onChange={(e, newValue) => setHistoryTab(newValue)}>
              <Tab
                icon={<AssignmentIcon />}
                iconPosition="start"
                label={`Medical Records (${patientHistory.medicalRecords.length})`}
              />
              <Tab
                icon={<CalendarIcon />}
                iconPosition="start"
                label={`Appointments (${patientHistory.appointments.length})`}
              />
              <Tab
                icon={<ScienceIcon />}
                iconPosition="start"
                label={`Lab Tests (${patientHistory.labRequests.length})`}
              />
              <Tab
                icon={<PrescriptionIcon />}
                iconPosition="start"
                label={`Prescriptions (${patientHistory.prescriptions.length})`}
              />
              <Tab
                icon={<ReceiptIcon />}
                iconPosition="start"
                label={`Invoices (${patientHistory.invoices.length})`}
              />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Medical Records Tab */}
                  {historyTab === 0 && (
                    <TableContainer>
                      {patientHistory.medicalRecords.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                          No medical records found
                        </Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Doctor</TableCell>
                              <TableCell>Chief Complaint</TableCell>
                              <TableCell>Diagnosis</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {patientHistory.medicalRecords.map((record) => {
                              const doctor = typeof record.doctor === 'object' ? record.doctor : null;
                              const recordDate = record.date
                                ? typeof record.date === 'string'
                                  ? new Date(record.date)
                                  : record.date
                                : null;
                              return (
                                <TableRow key={record.id || record._id} hover>
                                  <TableCell>
                                    {recordDate ? recordDate.toLocaleDateString() : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {doctor
                                      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell>{record.chiefComplaint || '-'}</TableCell>
                                  <TableCell>
                                    {record.diagnosis && record.diagnosis.length > 0
                                      ? record.diagnosis.join(', ')
                                      : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={record.status || 'Active'}
                                      color="success"
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </TableContainer>
                  )}

                  {/* Appointments Tab */}
                  {historyTab === 1 && (
                    <TableContainer>
                      {patientHistory.appointments.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                          No appointments found
                        </Typography>
                      ) : (
                        <Table size="small">
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
                            {patientHistory.appointments.map((appointment) => {
                              const doctor = typeof appointment.doctor === 'object' ? appointment.doctor : null;
                              const appointmentDate = appointment.appointmentDate
                                ? typeof appointment.appointmentDate === 'string'
                                  ? new Date(appointment.appointmentDate)
                                  : appointment.appointmentDate
                                : null;
                              return (
                                <TableRow key={appointment.id || appointment._id} hover>
                                  <TableCell>
                                    {appointmentDate ? appointmentDate.toLocaleDateString() : 'N/A'}
                                  </TableCell>
                                  <TableCell>{appointment.appointmentTime || 'N/A'}</TableCell>
                                  <TableCell>
                                    {doctor
                                      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell>{appointment.reason || '-'}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={appointment.status || 'N/A'}
                                      color={getStatusColor(appointment.status)}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </TableContainer>
                  )}

                  {/* Lab Tests Tab */}
                  {historyTab === 2 && (
                    <TableContainer>
                      {patientHistory.labRequests.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                          No lab tests found
                        </Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Order Date</TableCell>
                              <TableCell>Tests</TableCell>
                              <TableCell>Priority</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {patientHistory.labRequests.map((request) => {
                              const orderDate = request.orderDate
                                ? typeof request.orderDate === 'string'
                                  ? new Date(request.orderDate)
                                  : request.orderDate
                                : null;
                              const tests = request.tests || [];
                              return (
                                <TableRow key={request.id || request._id} hover>
                                  <TableCell>
                                    {orderDate ? orderDate.toLocaleDateString() : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {tests.length > 0
                                      ? tests
                                          .map((t: any) => {
                                            const test = typeof t.test === 'object' ? t.test : null;
                                            return test ? test.name : 'Unknown';
                                          })
                                          .join(', ')
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={request.priority}
                                      size="small"
                                      color={
                                        request.priority === 'Urgent' || request.priority === 'Stat'
                                          ? 'error'
                                          : 'default'
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={request.status}
                                      color={getStatusColor(request.status)}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </TableContainer>
                  )}

                  {/* Prescriptions Tab */}
                  {historyTab === 3 && (
                    <TableContainer>
                      {patientHistory.prescriptions.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                          No prescriptions found
                        </Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Doctor</TableCell>
                              <TableCell>Medications</TableCell>
                              <TableCell>Instructions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {patientHistory.prescriptions.map((prescription) => {
                              const doctor = typeof prescription.doctor === 'object' ? prescription.doctor : null;
                              const prescriptionDate = prescription.date
                                ? typeof prescription.date === 'string'
                                  ? new Date(prescription.date)
                                  : prescription.date
                                : null;
                              const medications = prescription.medications || [];
                              return (
                                <TableRow key={prescription.id || prescription._id} hover>
                                  <TableCell>
                                    {prescriptionDate
                                      ? prescriptionDate.toLocaleDateString()
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {doctor
                                      ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {medications.length > 0
                                      ? medications
                                          .map(
                                            (med: any) =>
                                              `${med.name}${med.dosage ? ` - ${med.dosage}` : ''}${
                                                med.frequency ? ` (${med.frequency})` : ''
                                              }`
                                          )
                                          .join(', ')
                                      : '-'}
                                  </TableCell>
                                  <TableCell>{prescription.instructions || '-'}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </TableContainer>
                  )}

                  {/* Invoices Tab */}
                  {historyTab === 4 && (
                    <TableContainer>
                      {patientHistory.invoices.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                          No invoices found
                        </Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Invoice #</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Total Amount</TableCell>
                              <TableCell>Paid</TableCell>
                              <TableCell>Outstanding</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {patientHistory.invoices.map((invoice) => {
                              const invoiceDate = invoice.invoiceDate
                                ? typeof invoice.invoiceDate === 'string'
                                  ? new Date(invoice.invoiceDate)
                                  : invoice.invoiceDate
                                : null;
                              const totalPaid =
                                invoice.payments && invoice.payments.length > 0
                                  ? invoice.payments
                                      .filter((p: any) => p.status === 'Completed')
                                      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                                  : 0;
                              const outstanding = invoice.total - totalPaid;
                              return (
                                <TableRow key={invoice.id || invoice._id} hover>
                                  <TableCell>{invoice.invoiceNumber || 'N/A'}</TableCell>
                                  <TableCell>
                                    {invoiceDate ? invoiceDate.toLocaleDateString() : 'N/A'}
                                  </TableCell>
                                  <TableCell>{formatCurrency(invoice.total)}</TableCell>
                                  <TableCell>{formatCurrency(totalPaid)}</TableCell>
                                  <TableCell>{formatCurrency(outstanding)}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={invoice.status}
                                      color={getStatusColor(invoice.status)}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </TableContainer>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

