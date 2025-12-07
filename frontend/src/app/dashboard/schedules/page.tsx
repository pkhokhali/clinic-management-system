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
  Checkbox,
  Divider,
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
    selectedDays: [] as number[], // Array of selected day indices
    daySchedules: {} as { [key: number]: { startTime: string; endTime: string } }, // Time ranges for each day
    specificDate: '',
    startTime: '09:00', // Default time (used when adding new days)
    endTime: '17:00', // Default time (used when adding new days)
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

  // Handle day selection
  const handleDayToggle = (dayIndex: number) => {
    const newSelectedDays = formData.selectedDays.includes(dayIndex)
      ? formData.selectedDays.filter(d => d !== dayIndex)
      : [...formData.selectedDays, dayIndex].sort();

    const newDaySchedules = { ...formData.daySchedules };
    
    // If adding a day, set default times
    if (!formData.selectedDays.includes(dayIndex)) {
      newDaySchedules[dayIndex] = {
        startTime: formData.startTime,
        endTime: formData.endTime,
      };
    } else {
      // If removing a day, remove its schedule
      delete newDaySchedules[dayIndex];
    }

    setFormData({
      ...formData,
      selectedDays: newSelectedDays,
      daySchedules: newDaySchedules,
    });
  };

  // Handle time change for a specific day
  const handleDayTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setFormData({
      ...formData,
      daySchedules: {
        ...formData.daySchedules,
        [dayIndex]: {
          ...formData.daySchedules[dayIndex],
          [field]: value,
        },
      },
    });
  };

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

      if (formData.isRecurring && formData.selectedDays.length === 0) {
        setError('Please select at least one day of week for recurring schedule');
        setSubmitting(false);
        return;
      }

      if (!formData.isRecurring && !formData.specificDate) {
        setError('Please select a specific date for one-time schedule');
        setSubmitting(false);
        return;
      }

      // Validate that all selected days have time ranges
      if (formData.isRecurring) {
        for (const dayIndex of formData.selectedDays) {
          if (!formData.daySchedules[dayIndex] || !formData.daySchedules[dayIndex].startTime || !formData.daySchedules[dayIndex].endTime) {
            setError(`Please set time range for ${DAYS_OF_WEEK[dayIndex]}`);
            setSubmitting(false);
            return;
          }
        }
      }

      if (editingSchedule) {
        // For editing, update the single schedule
        const payload: any = {
          doctor: formData.doctor,
          startTime: formData.isRecurring 
            ? formData.daySchedules[formData.selectedDays[0]]?.startTime || formData.startTime
            : formData.startTime,
          endTime: formData.isRecurring
            ? formData.daySchedules[formData.selectedDays[0]]?.endTime || formData.endTime
            : formData.endTime,
          slotDuration: formData.slotDuration,
          isRecurring: formData.isRecurring,
          isActive: formData.isActive,
          effectiveFrom: formData.effectiveFrom || new Date(),
        };

        if (formData.isRecurring) {
          payload.dayOfWeek = formData.selectedDays[0];
        } else {
          payload.specificDate = formData.specificDate;
        }

        if (formData.effectiveUntil) {
          payload.effectiveUntil = formData.effectiveUntil;
        }

        await api.put(`/schedules/${editingSchedule.id || editingSchedule._id}`, payload);
        setSuccess('Schedule updated successfully!');
      } else {
        // For new schedules, create one entry per selected day
        if (formData.isRecurring) {
          const promises = formData.selectedDays.map(dayIndex => {
            const payload: any = {
              doctor: formData.doctor,
              startTime: formData.daySchedules[dayIndex].startTime,
              endTime: formData.daySchedules[dayIndex].endTime,
              slotDuration: formData.slotDuration,
              isRecurring: true,
              dayOfWeek: dayIndex,
              isActive: formData.isActive,
              effectiveFrom: formData.effectiveFrom || new Date(),
            };

            if (formData.effectiveUntil) {
              payload.effectiveUntil = formData.effectiveUntil;
            }

            return api.post('/schedules', payload);
          });

          await Promise.all(promises);
          setSuccess(`Successfully created ${formData.selectedDays.length} schedule(s)!`);
        } else {
          // One-time schedule
          const payload: any = {
            doctor: formData.doctor,
            startTime: formData.startTime,
            endTime: formData.endTime,
            slotDuration: formData.slotDuration,
            isRecurring: false,
            specificDate: formData.specificDate,
            isActive: formData.isActive,
            effectiveFrom: formData.effectiveFrom || new Date(),
          };

          if (formData.effectiveUntil) {
            payload.effectiveUntil = formData.effectiveUntil;
          }

          await api.post('/schedules', payload);
          setSuccess('Schedule created successfully!');
        }
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
    const dayOfWeek = schedule.dayOfWeek ?? 1;
    
    setFormData({
      doctor: doctorId || '',
      isRecurring: schedule.isRecurring,
      selectedDays: schedule.isRecurring ? [dayOfWeek] : [],
      daySchedules: schedule.isRecurring ? {
        [dayOfWeek]: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        },
      } : {},
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
      selectedDays: [],
      daySchedules: {},
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
                  <>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Select Days of Week (Multiple selection allowed)
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {DAYS_OF_WEEK.map((day, index) => (
                          <FormControlLabel
                            key={index}
                            control={
                              <Checkbox
                                checked={formData.selectedDays.includes(index)}
                                onChange={() => handleDayToggle(index)}
                              />
                            }
                            label={day}
                          />
                        ))}
                      </Box>
                    </Box>

                    {formData.selectedDays.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, mt: 2 }}>
                          Set Time Range for Each Selected Day
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {formData.selectedDays.map((dayIndex) => (
                            <Paper key={dayIndex} sx={{ p: 2, bgcolor: 'background.default' }}>
                              <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                                {DAYS_OF_WEEK[dayIndex]}
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    label="Start Time"
                                    type="time"
                                    value={formData.daySchedules[dayIndex]?.startTime || formData.startTime}
                                    onChange={(e) => handleDayTimeChange(dayIndex, 'startTime', e.target.value)}
                                    fullWidth
                                    required
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    label="End Time"
                                    type="time"
                                    value={formData.daySchedules[dayIndex]?.endTime || formData.endTime}
                                    onChange={(e) => handleDayTimeChange(dayIndex, 'endTime', e.target.value)}
                                    fullWidth
                                    required
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {formData.selectedDays.length === 0 && (
                      <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Select at least one day above to set time ranges
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Default Time (Applied when adding new days)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Default Start Time"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }}
                          helperText="Used when adding new days"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Default End Time"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }}
                          helperText="Used when adding new days"
                        />
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                <TextField
                  label="Slot Duration (minutes)"
                  type="number"
                  value={formData.slotDuration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 30;
                    // Ensure value is within allowed range
                    const clampedValue = Math.min(Math.max(value, 5), 50);
                    setFormData({ ...formData, slotDuration: clampedValue });
                  }}
                  fullWidth
                  inputProps={{ min: 5, max: 50, step: 5 }}
                  helperText="Duration of each appointment slot (5-50 minutes)"
                  error={formData.slotDuration < 5 || formData.slotDuration > 50}
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
                disabled={
                  submitting ||
                  !formData.doctor ||
                  (formData.isRecurring && (
                    formData.selectedDays.length === 0 ||
                    formData.selectedDays.some(day => 
                      !formData.daySchedules[day] || 
                      !formData.daySchedules[day].startTime || 
                      !formData.daySchedules[day].endTime
                    )
                  )) ||
                  (!formData.isRecurring && (!formData.specificDate || !formData.startTime || !formData.endTime))
                }
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

