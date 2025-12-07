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
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
  Science as ScienceIcon,
  LocalPharmacy as PrescriptionIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { User } from '@/types';

interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  isActive: boolean;
}

export default function PatientsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [editingPatient, setEditingPatient] = useState<User | null>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'A+',
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Patient history states
  const [historyTab, setHistoryTab] = useState(0);
  const [patientHistory, setPatientHistory] = useState({
    medicalRecords: [] as any[],
    appointments: [] as any[],
    labRequests: [] as any[],
    prescriptions: [] as any[],
    invoices: [] as any[],
  });
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch patients (users with role = Patient)
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If current user is a Patient, only fetch their own data
      const response = currentUser?.role === 'Patient'
        ? await api.get('/auth/me')
        : await api.get('/users?role=Patient');
      
      let patientsList: any[] = [];
      if (currentUser?.role === 'Patient') {
        // For patients, show only themselves
        patientsList = [response.data.data.user].filter(Boolean).map((user: any) => ({
          ...user,
          id: user._id || user.id,
        }));
      } else {
        patientsList = (response.data.data.users || []).map((user: any) => ({
          ...user,
          id: user._id || user.id,
        }));
      }
      setPatients(patientsList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients by search term
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.firstName?.toLowerCase().includes(searchLower) ||
      patient.lastName?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm)
    );
  });

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | Date | undefined): number | null => {
    if (!dateOfBirth) return null;
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: 'Patient',
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        isActive: formData.isActive,
      };

      if (editingPatient) {
        // Update existing patient
        if (formData.password) payload.password = formData.password;
        await api.put(`/users/${editingPatient.id}`, payload);
        setSuccess('Patient updated successfully!');
      } else {
        // Create new patient
        payload.password = formData.password || 'Default@123';
        await api.post('/users', payload);
        setSuccess('Patient created successfully!');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchPatients();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (patient: User) => {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      password: '',
      dateOfBirth: patient.dateOfBirth ? (typeof patient.dateOfBirth === 'string' ? patient.dateOfBirth.split('T')[0] : new Date(patient.dateOfBirth).toISOString().split('T')[0]) : '',
      gender: (patient.gender as 'Male' | 'Female' | 'Other') || 'Male',
      bloodGroup: (patient.bloodGroup as typeof formData.bloodGroup) || 'A+',
      isActive: patient.isActive !== false,
    });
    setOpenDialog(true);
  };

  // Handle view - fetch patient history
  const handleView = async (patient: User) => {
    setSelectedPatient(patient);
    setOpenViewDialog(true);
    setHistoryTab(0);
    await fetchPatientHistory(patient.id || (patient as any)._id);
  };

  // Fetch comprehensive patient history
  const fetchPatientHistory = async (patientId: string) => {
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

  // Handle add new
  const handleAddNew = () => {
    setEditingPatient(null);
    resetForm();
    setOpenDialog(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      dateOfBirth: '',
      gender: 'Male',
      bloodGroup: 'A+',
      isActive: true,
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPatient(null);
    resetForm();
    setError(null);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedPatient(null);
    setHistoryTab(0);
    setPatientHistory({
      medicalRecords: [],
      appointments: [],
      labRequests: [],
      prescriptions: [],
      invoices: [],
    });
  };

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

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Patient']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {currentUser?.role === 'Patient' ? 'My Profile' : 'Patients Management'}
            </Typography>
            {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
              >
                Add New Patient
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
                        Total Patients
                      </Typography>
                      <Typography variant="h4">{patients.length}</Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                        Active Patients
                      </Typography>
                      <Typography variant="h4">
                        {patients.filter(p => p.isActive !== false).length}
                      </Typography>
                    </Box>
                    <HospitalIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search Filter */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <TextField
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: '100%', maxWidth: 500 }}
            />
          </Paper>

          {/* Patients Table */}
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredPatients.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No patients found</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Blood Group</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((patient) => {
                    const age = calculateAge(patient.dateOfBirth);
                    return (
                      <TableRow key={patient.id} hover>
                        <TableCell>
                          {patient.firstName} {patient.lastName}
                        </TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{age !== null ? `${age} years` : 'N/A'}</TableCell>
                        <TableCell>{patient.gender || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={patient.bloodGroup || 'N/A'}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={patient.isActive !== false ? 'Active' : 'Inactive'}
                            color={patient.isActive !== false ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Patient History">
                            <IconButton
                              size="small"
                              onClick={() => handleView(patient)}
                              color="primary"
                            >
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist') && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(patient)}
                                color="primary"
                              >
                                <EditIcon />
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

          {/* Add/Edit Dialog */}
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist') && (
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth scroll="paper">
              <DialogTitle>
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  <TextField
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    fullWidth
                    disabled={!!editingPatient}
                  />
                  <TextField
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    fullWidth
                    inputProps={{ maxLength: 10 }}
                  />
                  <TextField
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <FormControl fullWidth required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Gender"
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={formData.bloodGroup}
                      label="Blood Group"
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as typeof formData.bloodGroup })}
                    >
                      <MenuItem value="A+">A+</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label={editingPatient ? 'New Password (leave empty to keep current)' : 'Password'}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    fullWidth
                    required={!editingPatient}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.isActive ? 'Active' : 'Inactive'}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'Active' })}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={
                    submitting ||
                    !formData.firstName ||
                    !formData.lastName ||
                    !formData.email ||
                    !formData.phone ||
                    !formData.dateOfBirth ||
                    !formData.gender ||
                    !formData.bloodGroup ||
                    (!editingPatient && !formData.password)
                  }
                >
                  {submitting ? <CircularProgress size={24} /> : editingPatient ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Patient History Dialog */}
          <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="lg" fullWidth scroll="paper">
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                <Typography variant="h6">Patient History - {selectedPatient?.firstName} {selectedPatient?.lastName}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedPatient && (
                <Box>
                  {/* Patient Basic Info */}
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography variant="body1">
                          <EmailIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                          {selectedPatient.email}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1">
                          <PhoneIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                          {selectedPatient.phone}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Age / DOB</Typography>
                        <Typography variant="body1">
                          <CalendarIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                          {selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}
                          {selectedPatient.dateOfBirth && ` (Age: ${calculateAge(selectedPatient.dateOfBirth)} years)`}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Gender / Blood Group</Typography>
                        <Typography variant="body1">
                          {selectedPatient.gender || 'N/A'}
                          {' / '}
                          <Chip label={selectedPatient.bloodGroup || 'N/A'} color="error" size="small" sx={{ ml: 1 }} />
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                        <Chip
                          label={selectedPatient.isActive !== false ? 'Active' : 'Inactive'}
                          color={selectedPatient.isActive !== false ? 'success' : 'default'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  <Divider sx={{ my: 2 }} />

                  {/* History Tabs */}
                  <Paper>
                    <Tabs value={historyTab} onChange={(e, newValue) => setHistoryTab(newValue)}>
                      <Tab icon={<AssignmentIcon />} iconPosition="start" label={`Medical Records (${patientHistory.medicalRecords.length})`} />
                      <Tab icon={<CalendarIcon />} iconPosition="start" label={`Appointments (${patientHistory.appointments.length})`} />
                      <Tab icon={<ScienceIcon />} iconPosition="start" label={`Lab Tests (${patientHistory.labRequests.length})`} />
                      <Tab icon={<PrescriptionIcon />} iconPosition="start" label={`Prescriptions (${patientHistory.prescriptions.length})`} />
                      <Tab icon={<ReceiptIcon />} iconPosition="start" label={`Invoices (${patientHistory.invoices.length})`} />
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
                                      <TableCell>Diagnosis</TableCell>
                                      <TableCell>Follow-up</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {patientHistory.medicalRecords.map((record) => {
                                      const doctor = typeof record.doctor === 'object' ? record.doctor : null;
                                      const recordDate = record.date ? (typeof record.date === 'string' ? new Date(record.date) : record.date) : null;
                                      return (
                                        <TableRow key={record.id || record._id}>
                                          <TableCell>{recordDate ? recordDate.toLocaleDateString() : 'N/A'}</TableCell>
                                          <TableCell>{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}</TableCell>
                                          <TableCell>
                                            {record.diagnosis?.length > 0 ? record.diagnosis.join(', ') : '-'}
                                          </TableCell>
                                          <TableCell>
                                            {record.followUp?.date ? new Date(record.followUp.date).toLocaleDateString() : '-'}
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
                                        ? (typeof appointment.appointmentDate === 'string' ? new Date(appointment.appointmentDate) : appointment.appointmentDate)
                                        : null;
                                      return (
                                        <TableRow key={appointment.id || appointment._id}>
                                          <TableCell>{appointmentDate ? appointmentDate.toLocaleDateString() : 'N/A'}</TableCell>
                                          <TableCell>{appointment.appointmentTime || 'N/A'}</TableCell>
                                          <TableCell>{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}</TableCell>
                                          <TableCell>{appointment.reason || '-'}</TableCell>
                                          <TableCell>
                                            <Chip label={appointment.status || 'N/A'} size="small" color={getStatusColor(appointment.status)} />
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
                                      <TableCell>Doctor</TableCell>
                                      <TableCell>Status</TableCell>
                                      <TableCell>Billed</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {patientHistory.labRequests.map((request) => {
                                      const doctor = typeof request.doctor === 'object' ? request.doctor : null;
                                      const orderDate = request.orderDate
                                        ? (typeof request.orderDate === 'string' ? new Date(request.orderDate) : request.orderDate)
                                        : null;
                                      const tests = request.tests || [];
                                      const testNames = tests.slice(0, 2).map((t: any) => {
                                        const test = typeof t.test === 'object' ? t.test : null;
                                        return test?.name || 'Unknown';
                                      }).join(', ');
                                      return (
                                        <TableRow key={request.id || request._id}>
                                          <TableCell>{orderDate ? orderDate.toLocaleDateString() : 'N/A'}</TableCell>
                                          <TableCell>
                                            {testNames || '-'}
                                            {tests.length > 2 ? ` +${tests.length - 2} more` : ''}
                                          </TableCell>
                                          <TableCell>{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}</TableCell>
                                          <TableCell>
                                            <Chip label={request.status || 'Pending'} size="small" color={getStatusColor(request.status)} />
                                          </TableCell>
                                          <TableCell>
                                            <Chip
                                              label={request.isBilled ? 'Yes' : 'No'}
                                              size="small"
                                              color={request.isBilled ? 'success' : 'warning'}
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
                                      <TableCell>Status</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {patientHistory.prescriptions.map((prescription) => {
                                      const doctor = typeof prescription.doctor === 'object' ? prescription.doctor : null;
                                      const prescriptionDate = prescription.date
                                        ? (typeof prescription.date === 'string' ? new Date(prescription.date) : prescription.date)
                                        : null;
                                      return (
                                        <TableRow key={prescription.id || prescription._id}>
                                          <TableCell>{prescriptionDate ? prescriptionDate.toLocaleDateString() : 'N/A'}</TableCell>
                                          <TableCell>{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}</TableCell>
                                          <TableCell>
                                            {prescription.medications?.length > 0
                                              ? `${prescription.medications.length} medication(s)`
                                              : '-'}
                                          </TableCell>
                                          <TableCell>
                                            <Chip label={prescription.status || 'Active'} size="small" color={getStatusColor(prescription.status)} />
                                          </TableCell>
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
                                      <TableCell>Items</TableCell>
                                      <TableCell>Total</TableCell>
                                      <TableCell>Status</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {patientHistory.invoices.map((invoice) => {
                                      const invoiceDate = invoice.invoiceDate
                                        ? (typeof invoice.invoiceDate === 'string' ? new Date(invoice.invoiceDate) : invoice.invoiceDate)
                                        : null;
                                      const totalPaid = invoice.payments
                                        ? invoice.payments.filter((p: any) => p.status === 'Completed').reduce((sum: number, p: any) => sum + p.amount, 0)
                                        : 0;
                                      return (
                                        <TableRow key={invoice.id || invoice._id}>
                                          <TableCell>{invoice.invoiceNumber}</TableCell>
                                          <TableCell>{invoiceDate ? invoiceDate.toLocaleDateString() : 'N/A'}</TableCell>
                                          <TableCell>{invoice.items?.length || 0} item(s)</TableCell>
                                          <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                              {formatCurrency(invoice.total)}
                                            </Typography>
                                            {totalPaid > 0 && (
                                              <Typography variant="caption" color="text.secondary">
                                                Paid: {formatCurrency(totalPaid)}
                                              </Typography>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <Chip label={invoice.status || 'Pending'} size="small" color={getStatusColor(invoice.status)} />
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
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
