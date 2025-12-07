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
  Switch,
  FormControlLabel,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { User } from '@/types';

interface DoctorSchedule {
  _id?: string;
  id?: string;
  doctor: string | User;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  specificDate?: string | Date;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isRecurring: boolean;
  isActive: boolean;
  effectiveFrom?: string | Date;
  effectiveUntil?: string | Date;
  createdBy?: string | User;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function DoctorSchedulesPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(null);
  const [formData, setFormData] = useState({
    doctor: '',
    isRecurring: true,
    dayOfWeek: 1,
    specificDate: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    isActive: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveUntil: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (doctorFilter !== 'all') {
        params.append('doctor', doctorFilter);
      }
      if (activeFilter !== 'all') {
        params.append('isActive', activeFilter === 'active' ? 'true' : 'false');
      }
      
      const response = await api.get(`/schedules?${params.toString()}`);
      const schedulesList = (response.data.data.schedules || []).map((schedule: any) => ({
        ...schedule,
        id: schedule._id || schedule.id,
      }));
      setSchedules(schedulesList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchSchedules();
    fetchDoctors();
  }, [doctorFilter, activeFilter]);

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    const searchLower = searchTerm.toLowerCase();
    const doctor = typeof schedule.doctor === 'object' ? schedule.doctor : null;
    
    return (
      (doctor && `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchLower)) ||
      (schedule.isRecurring && DAYS_OF_WEEK[schedule.dayOfWeek || 0]?.toLowerCase().includes(searchLower)) ||
      schedule.startTime.toLowerCase().includes(searchLower) ||
      schedule.endTime.toLowerCase().includes(searchLower)
    );
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!formData.doctor) {
        setError('Please select a doctor');
        setSubmitting(false);
        return;
      }

      if (formData.isRecurring && formData.dayOfWeek === undefined) {
        setError('Please select a day of week for recurring schedule');
        setSubmitting(false);
        return;
      }

      if (!formData.isRecurring && !formData.specificDate) {
        setError('Please select a specific date for one-time schedule');
        setSubmitting(false);
        return;
      }

      const payload: any = {
        doctor: formData.doctor,
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotDuration: formData.slotDuration,
        isRecurring: formData.isRecurring,
        isActive: formData.isActive,
        effectiveFrom: formData.effectiveFrom || new Date(),
      };

      if (formData.isRecurring) {
        payload.dayOfWeek = formData.dayOfWeek;
      } else {
        payload.specificDate = formData.specificDate;
      }

      if (formData.effectiveUntil) {
        payload.effectiveUntil = formData.effectiveUntil;
      }

      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule.id || editingSchedule._id}`, payload);
        setSuccess('Schedule updated successfully!');
      } else {
        await api.post('/schedules', payload);
        setSuccess('Schedule created successfully!');
      }

      setOpenDialog(false);
      resetForm();
      fetchSchedules();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (schedule: DoctorSchedule) => {
    setEditingSchedule(schedule);
    const doctorId = typeof schedule.doctor === 'object' ? schedule.doctor.id : schedule.doctor;
    setFormData({
      doctor: doctorId || '',
      isRecurring: schedule.isRecurring,
      dayOfWeek: schedule.dayOfWeek ?? 1,
      specificDate: schedule.specificDate
        ? (typeof schedule.specificDate === 'string'
            ? schedule.specificDate.split('T')[0]
            : new Date(schedule.specificDate).toISOString().split('T')[0])
        : '',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      slotDuration: schedule.slotDuration || 30,
      isActive: schedule.isActive !== false,
      effectiveFrom: schedule.effectiveFrom
        ? (typeof schedule.effectiveFrom === 'string'
            ? schedule.effectiveFrom.split('T')[0]
            : new Date(schedule.effectiveFrom).toISOString().split('T')[0])
        : new Date().toISOString().split('T')[0],
      effectiveUntil: schedule.effectiveUntil
        ? (typeof schedule.effectiveUntil === 'string'
            ? schedule.effectiveUntil.split('T')[0]
            : new Date(schedule.effectiveUntil).toISOString().split('T')[0])
        : '',
    });
    setOpenDialog(true);
  };

  // Handle delete
  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      await api.delete(`/schedules/${scheduleId}`);
      setSuccess('Schedule deleted successfully!');
      fetchSchedules();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete schedule');
    }
  };

  // Reset form
  const resetForm = () => {
    setEditingSchedule(null);
    setFormData({
      doctor: '',
      isRecurring: true,
      dayOfWeek: 1,
      specificDate: '',
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: true,
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveUntil: '',
    });
  };

  // Handle add new
  const handleAddNew = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
    setError(null);
  };

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Doctor Schedules (Rota)
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
            >
              Add Schedule
            </Button>
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
                placeholder="Search by doctor name or day..."
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
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={activeFilter}
                  label="Filter by Status"
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Schedules Table */}
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredSchedules.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No schedules found</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Day/Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Slot Duration</TableCell>
                    <TableCell>Effective From</TableCell>
                    <TableCell>Effective Until</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSchedules.map((schedule) => {
                    const doctor = typeof schedule.doctor === 'object' ? schedule.doctor : null;
                    const effectiveFrom = schedule.effectiveFrom
                      ? (typeof schedule.effectiveFrom === 'string'
                          ? new Date(schedule.effectiveFrom)
                          : schedule.effectiveFrom)
                      : null;
                    const effectiveUntil = schedule.effectiveUntil
                      ? (typeof schedule.effectiveUntil === 'string'
                          ? new Date(schedule.effectiveUntil)
                          : schedule.effectiveUntil)
                      : null;
                    const specificDate = schedule.specificDate
                      ? (typeof schedule.specificDate === 'string'
                          ? new Date(schedule.specificDate)
                          : schedule.specificDate)
                      : null;

                    return (
                      <TableRow key={schedule.id || schedule._id} hover>
                        <TableCell>
                          {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.isRecurring ? 'Recurring' : 'One-time'}
                            color={schedule.isRecurring ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {schedule.isRecurring
                            ? DAYS_OF_WEEK[schedule.dayOfWeek || 0]
                            : specificDate
                            ? specificDate.toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {schedule.startTime} - {schedule.endTime}
                        </TableCell>
                        <TableCell>{schedule.slotDuration} min</TableCell>
                        <TableCell>
                          {effectiveFrom ? effectiveFrom.toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {effectiveUntil ? effectiveUntil.toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.isActive ? 'Active' : 'Inactive'}
                            color={schedule.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(schedule)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(schedule.id || schedule._id || '')}
                              color="error"
                            >
                              <DeleteIcon />
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

          {/* Add/Edit Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle>
              {editingSchedule ? 'Edit Doctor Schedule' : 'Add Doctor Schedule'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={formData.doctor}
                    label="Doctor"
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <ToggleButtonGroup
                  value={formData.isRecurring ? 'recurring' : 'onetime'}
                  exclusive
                  onChange={(e, value) => {
                    if (value !== null) {
                      setFormData({ ...formData, isRecurring: value === 'recurring' });
                    }
                  }}
                  fullWidth
                >
                  <ToggleButton value="recurring">Recurring (Weekly)</ToggleButton>
                  <ToggleButton value="onetime">One-time</ToggleButton>
                </ToggleButtonGroup>

                {formData.isRecurring ? (
                  <FormControl fullWidth required>
                    <InputLabel>Day of Week</InputLabel>
                    <Select
                      value={formData.dayOfWeek}
                      label="Day of Week"
                      onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as number })}
                    >
                      {DAYS_OF_WEEK.map((day, index) => (
                        <MenuItem key={index} value={index}>
                          {day}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="Specific Date"
                    type="date"
                    value={formData.specificDate}
                    onChange={(e) => setFormData({ ...formData, specificDate: e.target.value })}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0],
                    }}
                  />
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="End Time"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Slot Duration (minutes)"
                  type="number"
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({ ...formData, slotDuration: parseInt(e.target.value) || 30 })}
                  fullWidth
                  inputProps={{ min: 15, step: 15 }}
                  helperText="Duration of each appointment slot"
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Effective From"
                      type="date"
                      value={formData.effectiveFrom}
                      onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Effective Until (Optional)"
                      type="date"
                      value={formData.effectiveUntil}
                      onChange={(e) => setFormData({ ...formData, effectiveUntil: e.target.value })}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={submitting || !formData.doctor || !formData.startTime || !formData.endTime}
              >
                {submitting ? <CircularProgress size={24} /> : editingSchedule ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

