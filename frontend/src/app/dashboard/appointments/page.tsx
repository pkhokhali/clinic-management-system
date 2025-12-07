'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { User } from '@/types';

interface Appointment {
  id?: string;
  _id?: string;
  patient: string | User;
  doctor: string | User;
  appointmentDate: string | Date;
  appointmentTime: string;
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  reason?: string;
  notes?: string;
  duration?: number;
}

interface AppointmentFormData {
  patient: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  notes: string;
  status: string;
}

export default function AppointmentsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
    status: 'Scheduled',
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [scheduleInfo, setScheduleInfo] = useState<{ [key: string]: Array<{ startTime: string; endTime: string; slotDuration: number }> }>({});
  const [loadingAvailableDates, setLoadingAvailableDates] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (doctorFilter !== 'all') {
        params.append('doctor', doctorFilter);
      }
      
      const response = await api.get(`/appointments?${params.toString()}`);
      const appointmentsList = (response.data.data.appointments || []).map((apt: any) => ({
        ...apt,
        id: apt._id || apt.id,
      }));
      setAppointments(appointmentsList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
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

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const response = await api.get('/users?role=Doctor');
      const doctorsList = (response.data.data.users || []).map((user: any) => ({
        ...user,
        id: user._id || user.id,
      }));
      setDoctors(doctorsList);
    } catch (err: any) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  // Fetch available dates for selected doctor
  const fetchAvailableDates = async (doctorId: string) => {
    if (!doctorId) {
      setAvailableDates([]);
      setRecurringDays([]);
      setScheduleInfo({});
      return;
    }

    try {
      setLoadingAvailableDates(true);
      const response = await api.get(`/schedules/available-dates/${doctorId}?weeks=8`);
      const data = response.data.data;
      setAvailableDates(data.availableDates || []);
      setRecurringDays(data.recurringDays || []);
      setScheduleInfo(data.scheduleInfo || {});
    } catch (err: any) {
      console.error('Failed to fetch available dates:', err);
      setAvailableDates([]);
      setRecurringDays([]);
      setScheduleInfo({});
    } finally {
      setLoadingAvailableDates(false);
    }
  };

  // Fetch available time slots for selected doctor and date
  const fetchAvailableTimeSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    try {
      setLoadingTimeSlots(true);
      const response = await api.get(`/appointments/availability/${doctorId}?date=${date}`);
      setAvailableTimeSlots(response.data.data.availableSlots || []);
    } catch (err: any) {
      console.error('Failed to fetch available time slots:', err);
      setAvailableTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    if (currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist') {
      fetchPatients();
    }
    // All roles need doctors list for creating appointments
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, doctorFilter]);

  // Handle URL parameters from follow-up page
  useEffect(() => {
    const patientParam = searchParams?.get('patient');
    const doctorParam = searchParams?.get('doctor');
    const dateParam = searchParams?.get('date');
    const reasonParam = searchParams?.get('reason');

    if (patientParam || doctorParam || dateParam || reasonParam) {
      setFormData({
        patient: patientParam || '',
        doctor: doctorParam || '',
        appointmentDate: dateParam || '',
        appointmentTime: '',
        reason: reasonParam || '',
        notes: '',
        status: 'Scheduled',
      });

      // Fetch available dates and time slots if doctor is provided
      if (doctorParam) {
        fetchAvailableDates(doctorParam);
        if (dateParam) {
          fetchAvailableTimeSlots(doctorParam, dateParam);
        }
      }

      // Open the dialog automatically
      setOpenDialog(true);

      // Clear URL parameters
      window.history.replaceState({}, '', '/dashboard/appointments');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Filter appointments by search term
  const filteredAppointments = appointments.filter((apt) => {
    const searchLower = searchTerm.toLowerCase();
    const patient = typeof apt.patient === 'object' ? apt.patient : null;
    const doctor = typeof apt.doctor === 'object' ? apt.doctor : null;
    
    return (
      (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
      (doctor && `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchLower)) ||
      apt.appointmentTime?.toLowerCase().includes(searchLower) ||
      apt.reason?.toLowerCase().includes(searchLower)
    );
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate that selected date is in available dates list
      if (formData.appointmentDate && availableDates.length > 0 && !availableDates.includes(formData.appointmentDate)) {
        setError('Selected date is not available for this doctor. Please select an available date.');
        setSubmitting(false);
        return;
      }
      
      const payload: any = {
        doctor: formData.doctor,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        notes: formData.notes,
      };

      // Only set patient if it's provided (backend auto-assigns for Patient role)
      if (formData.patient) {
        payload.patient = formData.patient;
      }

      if (editingAppointment) {
        // Update existing appointment
        payload.status = formData.status;
        await api.put(`/appointments/${editingAppointment.id || (editingAppointment as any)._id}`, payload);
        setSuccess('Appointment updated successfully!');
      } else {
        // Create new appointment
        await api.post('/appointments', payload);
        setSuccess('Appointment created successfully!');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchAppointments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    if (!cancellingAppointment) return;
    
    try {
      await api.put(`/appointments/${cancellingAppointment.id || (cancellingAppointment as any)._id}/cancel`, {
        cancellationReason,
      });
      setSuccess('Appointment cancelled successfully!');
      setOpenCancelDialog(false);
      setCancellingAppointment(null);
      setCancellationReason('');
      fetchAppointments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  // Handle edit
  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const patientId = typeof appointment.patient === 'object' ? appointment.patient.id : appointment.patient;
    const doctorId = typeof appointment.doctor === 'object' ? appointment.doctor.id : appointment.doctor;
    const appointmentDate = appointment.appointmentDate
      ? (typeof appointment.appointmentDate === 'string' 
          ? appointment.appointmentDate.split('T')[0] 
          : new Date(appointment.appointmentDate).toISOString().split('T')[0])
      : '';
    
    setFormData({
      patient: patientId || '',
      doctor: doctorId || '',
      appointmentDate,
      appointmentTime: appointment.appointmentTime || '',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status || 'Scheduled',
    });
    
    if (doctorId) {
      // Fetch available dates and time slots for this doctor
      fetchAvailableDates(doctorId);
      if (appointmentDate) {
        fetchAvailableTimeSlots(doctorId, appointmentDate);
      }
    }
    
    setOpenDialog(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingAppointment(null);
    resetForm();
    setOpenDialog(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      patient: currentUser?.role === 'Patient' ? (currentUser.id || '') : '',
      doctor: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: '',
      status: 'Scheduled',
    });
    setAvailableTimeSlots([]);
    setAvailableDates([]);
    setRecurringDays([]);
    setScheduleInfo({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAppointment(null);
    resetForm();
    setError(null);
  };

  const handleStartCancel = (appointment: Appointment) => {
    setCancellingAppointment(appointment);
    setCancellationReason('');
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancellingAppointment(null);
    setCancellationReason('');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'Scheduled': 'primary',
      'Confirmed': 'secondary',
      'In Progress': 'warning',
      'Completed': 'success',
      'Cancelled': 'error',
      'No Show': 'default',
    };
    return colors[status] || 'default';
  };

  // Generate time slots (9 AM to 5 PM, 30-minute intervals)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  // Determine which time slots to show
  const timeSlotsToShow = availableTimeSlots.length > 0 ? availableTimeSlots : allTimeSlots;

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Patient']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Appointments Management
            </Typography>
            {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist' || currentUser?.role === 'Patient') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
              >
                Add New Appointment
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

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search by patient, doctor, or reason"
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
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="No Show">No Show</MenuItem>
                </Select>
              </FormControl>
              {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist') && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Doctor</InputLabel>
                  <Select
                    value={doctorFilter}
                    label="Filter by Doctor"
                    onChange={(e) => setDoctorFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Doctors</MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Paper>

          {/* Appointments Table */}
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredAppointments.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No appointments found</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.map((appointment) => {
                    const patient = typeof appointment.patient === 'object' ? appointment.patient : null;
                    const doctor = typeof appointment.doctor === 'object' ? appointment.doctor : null;
                    const appointmentDate = appointment.appointmentDate
                      ? (typeof appointment.appointmentDate === 'string' 
                          ? new Date(appointment.appointmentDate) 
                          : appointment.appointmentDate)
                      : null;

                    return (
                      <TableRow key={appointment.id || (appointment as any)._id} hover>
                        <TableCell>
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {appointmentDate ? appointmentDate.toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>{appointment.appointmentTime || 'N/A'}</TableCell>
                        <TableCell>{appointment.reason || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist') && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(appointment)}
                                color="primary"
                                disabled={appointment.status === 'Cancelled' || appointment.status === 'Completed'}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                onClick={() => handleStartCancel(appointment)}
                                color="error"
                              >
                                <CancelIcon />
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
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle>
              {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist') && (
                  <FormControl fullWidth required>
                    <InputLabel>Patient</InputLabel>
                    <Select
                      value={formData.patient}
                      label="Patient"
                      onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                    >
                      {patients.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} ({patient.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <FormControl fullWidth required>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={formData.doctor}
                    label="Doctor"
                    onChange={(e) => {
                      const doctorId = e.target.value;
                      setFormData({ 
                        ...formData, 
                        doctor: doctorId, 
                        appointmentDate: '',
                        appointmentTime: '' 
                      });
                      // Fetch available dates for this doctor
                      fetchAvailableDates(doctorId);
                      setAvailableTimeSlots([]);
                    }}
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {formData.doctor && (
                  <>
                    {loadingAvailableDates ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Loading available dates...</Typography>
                      </Box>
                    ) : availableDates.length === 0 ? (
                      <Alert severity="warning">
                        No available dates found for this doctor. Please select another doctor or ensure the doctor has a schedule configured.
                      </Alert>
                    ) : (
                      <>
                        <FormControl fullWidth required>
                          <InputLabel>Appointment Date</InputLabel>
                          <Select
                            value={formData.appointmentDate}
                            label="Appointment Date"
                            onChange={(e) => {
                              const selectedDate = e.target.value;
                              setFormData({ ...formData, appointmentDate: selectedDate, appointmentTime: '' });
                              if (formData.doctor) {
                                fetchAvailableTimeSlots(formData.doctor, selectedDate);
                              }
                            }}
                          >
                            {availableDates.map((date) => (
                              <MenuItem key={date} value={date}>
                                {new Date(date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {formData.appointmentDate && scheduleInfo[formData.appointmentDate] && (
                          <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                              Doctor Schedule for {new Date(formData.appointmentDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            {scheduleInfo[formData.appointmentDate].map((schedule, index) => (
                              <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                Time: {schedule.startTime} - {schedule.endTime} (Slot Duration: {schedule.slotDuration} min)
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </>
                )}
                
                {!formData.doctor && (
                  <TextField
                    label="Appointment Date"
                    type="date"
                    value={formData.appointmentDate}
                    disabled
                    required
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="Please select a doctor first"
                  />
                )}
                <FormControl fullWidth required>
                  <InputLabel>Time</InputLabel>
                  <Select
                    value={formData.appointmentTime}
                    label="Time"
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    disabled={!formData.doctor || !formData.appointmentDate || loadingTimeSlots}
                  >
                    {loadingTimeSlots ? (
                      <MenuItem disabled>Loading available slots...</MenuItem>
                    ) : timeSlotsToShow.length === 0 ? (
                      <MenuItem disabled>No available slots</MenuItem>
                    ) : (
                      timeSlotsToShow.map((time) => (
                        <MenuItem key={time} value={time}>
                          {time}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <TextField
                  label="Reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
                {editingAppointment && (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                      <MenuItem value="Confirmed">Confirmed</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                      <MenuItem value="No Show">No Show</MenuItem>
                    </Select>
                  </FormControl>
                )}
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
                  (!formData.patient && currentUser?.role !== 'Patient') ||
                  !formData.doctor ||
                  !formData.appointmentDate ||
                  !formData.appointmentTime
                }
              >
                {submitting ? <CircularProgress size={24} /> : editingAppointment ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Cancel Dialog */}
          <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogContent>
              <TextField
                label="Cancellation Reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{ mt: 2 }}
                placeholder="Please provide a reason for cancellation..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCancelDialog}>Cancel</Button>
              <Button
                onClick={handleCancel}
                variant="contained"
                color="error"
                disabled={!cancellationReason.trim()}
              >
                Confirm Cancellation
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
