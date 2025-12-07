'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  EventAvailable as EventAvailableIcon,
  Visibility as VisibilityIcon,
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
  followUp?: {
    date?: Date | string;
    notes?: string;
  };
  diagnosis?: string[];
}

export default function FollowUpAppointmentsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [followUps, setFollowUps] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Dialog states
  const [selectedFollowUp, setSelectedFollowUp] = useState<MedicalRecord | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  // Fetch follow-up appointments
  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (dateFilter === 'upcoming') {
        params.append('past', 'false');
      } else if (dateFilter === 'past') {
        params.append('past', 'true');
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      const response = await api.get(`/medical/records/follow-ups?${params.toString()}`);
      const followUpsList = (response.data.data.followUpAppointments || []).map((record: any) => ({
        ...record,
        id: record._id || record.id,
      }));
      setFollowUps(followUpsList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch follow-up appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, startDate, endDate]);

  // Filter follow-ups by search term
  const filteredFollowUps = followUps.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    const patient = typeof record.patient === 'object' ? record.patient : null;
    const doctor = typeof record.doctor === 'object' ? record.doctor : null;
    
    return (
      (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
      (patient && patient.email?.toLowerCase().includes(searchLower)) ||
      (patient && patient.phone?.toLowerCase().includes(searchLower)) ||
      (doctor && `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchLower)) ||
      record.followUp?.notes?.toLowerCase().includes(searchLower) ||
      record.diagnosis?.some(d => d.toLowerCase().includes(searchLower))
    );
  });

  const handleCreateAppointment = (followUp: MedicalRecord) => {
    const patientId = typeof followUp.patient === 'object' ? (followUp.patient.id || (followUp.patient as any)._id) : followUp.patient;
    const doctorId = typeof followUp.doctor === 'object' ? (followUp.doctor.id || (followUp.doctor as any)._id) : followUp.doctor;
    const followUpDate = followUp.followUp?.date 
      ? (typeof followUp.followUp.date === 'string' 
          ? followUp.followUp.date.split('T')[0] 
          : new Date(followUp.followUp.date).toISOString().split('T')[0])
      : '';
    
    // Navigate to appointments page with pre-filled data
    router.push(`/dashboard/appointments?patient=${patientId}&doctor=${doctorId}&date=${followUpDate}&reason=Follow-up appointment`);
  };

  const handleViewDetails = (followUp: MedicalRecord) => {
    setSelectedFollowUp(followUp);
    setOpenViewDialog(true);
  };

  const getFollowUpStatus = (followUpDate?: Date | string) => {
    if (!followUpDate) return { label: 'No Date', color: 'default' as const };
    
    const date = typeof followUpDate === 'string' ? new Date(followUpDate) : followUpDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(date);
    followUp.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: `${Math.abs(diffDays)} day(s) overdue`, color: 'error' as const };
    } else if (diffDays === 0) {
      return { label: 'Today', color: 'warning' as const };
    } else if (diffDays <= 7) {
      return { label: `In ${diffDays} day(s)`, color: 'warning' as const };
    } else {
      return { label: `In ${diffDays} day(s)`, color: 'success' as const };
    }
  };

  const patient = selectedFollowUp && typeof selectedFollowUp.patient === 'object' ? selectedFollowUp.patient : null;
  const doctor = selectedFollowUp && typeof selectedFollowUp.doctor === 'object' ? selectedFollowUp.doctor : null;

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Receptionist']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Follow-up Appointments
            </Typography>
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
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="Search by patient name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Date Filter</InputLabel>
                  <Select
                    value={dateFilter}
                    label="Date Filter"
                    onChange={(e) => setDateFilter(e.target.value as 'upcoming' | 'past' | 'all')}
                  >
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="past">Past</MenuItem>
                    <MenuItem value="all">All</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Follow-up Appointments Table */}
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredFollowUps.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No follow-up appointments found</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Follow-up Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Has Appointment?</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFollowUps.map((record) => {
                    const patientObj = typeof record.patient === 'object' ? record.patient : null;
                    const doctorObj = typeof record.doctor === 'object' ? record.doctor : null;
                    const followUpDate = record.followUp?.date
                      ? (typeof record.followUp.date === 'string' ? new Date(record.followUp.date) : record.followUp.date)
                      : null;
                    const status = getFollowUpStatus(record.followUp?.date);
                    const hasAppointment = record.appointment !== null && record.appointment !== undefined;

                    return (
                      <TableRow key={record.id || record._id} hover>
                        <TableCell>
                          {patientObj ? `${patientObj.firstName} ${patientObj.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {patientObj && (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <PhoneIcon fontSize="small" />
                                <Typography variant="body2">{patientObj.phone || 'N/A'}</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {patientObj.email || 'N/A'}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          {doctorObj ? `Dr. ${doctorObj.firstName} ${doctorObj.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {followUpDate ? followUpDate.toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip label={status.label} color={status.color} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {record.followUp?.notes || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {hasAppointment ? (
                            <Chip label="Scheduled" color="success" size="small" />
                          ) : (
                            <Chip label="Not Scheduled" color="warning" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(record)}
                                color="primary"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {!hasAppointment && (
                              <Tooltip title="Create Appointment">
                                <IconButton
                                  size="small"
                                  onClick={() => handleCreateAppointment(record)}
                                  color="success"
                                >
                                  <CalendarIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* View Details Dialog */}
          <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Follow-up Appointment Details</DialogTitle>
            <DialogContent>
              {selectedFollowUp && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                      </Typography>
                      {patient && (
                        <>
                          <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>{patient.email || 'N/A'}</Typography>
                          <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>{patient.phone || 'N/A'}</Typography>
                        </>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">Doctor</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">Follow-up Date</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedFollowUp.followUp?.date
                          ? (typeof selectedFollowUp.followUp.date === 'string'
                              ? new Date(selectedFollowUp.followUp.date).toLocaleDateString()
                              : selectedFollowUp.followUp.date.toLocaleDateString())
                          : 'N/A'}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">Follow-up Notes</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedFollowUp.followUp?.notes || 'No notes'}
                      </Typography>
                    </Grid>
                    {selectedFollowUp.diagnosis && selectedFollowUp.diagnosis.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Diagnosis</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {selectedFollowUp.diagnosis.map((diag, idx) => (
                            <Chip key={idx} label={diag} size="small" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
              {selectedFollowUp && !selectedFollowUp.appointment && (
                <Button
                  variant="contained"
                  startIcon={<CalendarIcon />}
                  onClick={() => {
                    setOpenViewDialog(false);
                    handleCreateAppointment(selectedFollowUp);
                  }}
                >
                  Create Appointment
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

