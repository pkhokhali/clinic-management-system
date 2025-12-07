'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Science as ScienceIcon,
  Description as DescriptionIcon,
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
}

export default function MyAppointmentsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openActionDialog, setOpenActionDialog] = useState(false);

  // Fetch doctor's appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('doctor', currentUser?.id || '');
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
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

  useEffect(() => {
    if (currentUser?.id) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, currentUser?.id]);

  // Filter appointments by search term
  const filteredAppointments = appointments.filter((apt) => {
    const searchLower = searchTerm.toLowerCase();
    const patient = typeof apt.patient === 'object' ? apt.patient : null;
    
    return (
      (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
      apt.appointmentTime?.toLowerCase().includes(searchLower) ||
      apt.reason?.toLowerCase().includes(searchLower)
    );
  });

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

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenActionDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenActionDialog(false);
    setSelectedAppointment(null);
  };

  const handleAddRecord = () => {
    if (selectedAppointment) {
      // Navigate to medical records page with appointment pre-filled
      const appointmentId = selectedAppointment.id || (selectedAppointment as any)._id;
      router.push(`/dashboard/medical-records?appointment=${appointmentId}`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Doctor']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              My Appointments
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search by patient name, time, or reason"
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
            </Box>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Appointments
                  </Typography>
                  <Typography variant="h4">
                    {appointments.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {appointments.filter(a => a.status === 'Completed').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Scheduled
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {appointments.filter(a => a.status === 'In Progress').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewAppointment(appointment)}
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
            )}
          </TableContainer>

          {/* View Appointment Dialog */}
          <Dialog open={openActionDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              Appointment Details
            </DialogTitle>
            <DialogContent>
              {selectedAppointment && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
                      <Typography variant="body1">
                        {typeof selectedAppointment.patient === 'object' 
                          ? `${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                      <Typography variant="body1">
                        {selectedAppointment.appointmentDate
                          ? (typeof selectedAppointment.appointmentDate === 'string'
                              ? new Date(selectedAppointment.appointmentDate).toLocaleDateString()
                              : selectedAppointment.appointmentDate.toLocaleDateString())
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Time</Typography>
                      <Typography variant="body1">{selectedAppointment.appointmentTime || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedAppointment.status}
                        color={getStatusColor(selectedAppointment.status)}
                        size="small"
                      />
                    </Grid>
                    {selectedAppointment.reason && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                        <Typography variant="body1">{selectedAppointment.reason}</Typography>
                      </Grid>
                    )}
                    {selectedAppointment.notes && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                        <Typography variant="body1">{selectedAppointment.notes}</Typography>
                      </Grid>
                    )}
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      startIcon={<AssignmentIcon />}
                      onClick={handleAddRecord}
                      disabled={selectedAppointment.status === 'Cancelled'}
                    >
                      Add Medical Record
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

