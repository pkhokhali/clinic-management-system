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
  Card,
  CardContent,
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
  consultationFee?: number;
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
    daySchedules: {} as { 
      [key: number]: Array<{ 
        id: string; // Unique ID for each time range
        startTime: string; 
        endTime: string; 
        slotDuration: number;
      }> 
    }, // Multiple time ranges for each day
    specificDate: '',
    startTime: '09:00', // Default time (used when adding new time ranges)
    endTime: '17:00', // Default time (used when adding new time ranges)
    slotDuration: 30, // Default slot duration
    consultationFee: 0, // Consultation fee for this schedule
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    // If adding a day, add a default time range
    if (!formData.selectedDays.includes(dayIndex)) {
      newDaySchedules[dayIndex] = [{
        id: `day-${dayIndex}-${Date.now()}`,
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotDuration: formData.slotDuration,
      }];
    } else {
      // If removing a day, remove all its time ranges
      delete newDaySchedules[dayIndex];
    }

    setFormData({
      ...formData,
      selectedDays: newSelectedDays,
      daySchedules: newDaySchedules,
    });
  };

  // Add a new time range for a specific day
  const handleAddTimeRange = (dayIndex: number) => {
    const currentRanges = formData.daySchedules[dayIndex] || [];
    const newRange = {
      id: `day-${dayIndex}-${Date.now()}`,
      startTime: formData.startTime,
      endTime: formData.endTime,
      slotDuration: formData.slotDuration,
    };
    
    setFormData({
      ...formData,
      daySchedules: {
        ...formData.daySchedules,
        [dayIndex]: [...currentRanges, newRange],
      },
    });
  };

  // Remove a time range for a specific day
  const handleRemoveTimeRange = (dayIndex: number, rangeId: string) => {
    const currentRanges = formData.daySchedules[dayIndex] || [];
    const updatedRanges = currentRanges.filter(range => range.id !== rangeId);
    
    if (updatedRanges.length === 0) {
      // If no ranges left, remove the day from selected days
      setFormData({
        ...formData,
        selectedDays: formData.selectedDays.filter(d => d !== dayIndex),
        daySchedules: {
          ...formData.daySchedules,
          [dayIndex]: [],
        },
      });
    } else {
      setFormData({
        ...formData,
        daySchedules: {
          ...formData.daySchedules,
          [dayIndex]: updatedRanges,
        },
      });
    }
  };

  // Handle time/slot duration change for a specific time range
  const handleTimeRangeChange = (
    dayIndex: number,
    rangeId: string,
    field: 'startTime' | 'endTime' | 'slotDuration',
    value: string | number
  ) => {
    const currentRanges = formData.daySchedules[dayIndex] || [];
    const updatedRanges = currentRanges.map(range => {
      if (range.id === rangeId) {
        return {
          ...range,
          [field]: value,
        };
      }
      return range;
    });
    
    setFormData({
      ...formData,
      daySchedules: {
        ...formData.daySchedules,
        [dayIndex]: updatedRanges,
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

      // Validate that all selected days have at least one time range
      if (formData.isRecurring) {
        for (const dayIndex of formData.selectedDays) {
          const dayRanges = formData.daySchedules[dayIndex] || [];
          if (dayRanges.length === 0) {
            setError(`Please add at least one time range for ${DAYS_OF_WEEK[dayIndex]}`);
            setSubmitting(false);
            return;
          }
          // Validate each time range
          for (const range of dayRanges) {
            if (!range.startTime || !range.endTime || !range.slotDuration) {
              setError(`Please complete all time range fields for ${DAYS_OF_WEEK[dayIndex]}`);
              setSubmitting(false);
              return;
            }
          }
        }
      }

      if (editingSchedule) {
        // For editing, update the single schedule (use first time range if multiple exist)
        const firstDayIndex = formData.selectedDays[0];
        const firstTimeRange = formData.isRecurring && firstDayIndex !== undefined
          ? (formData.daySchedules[firstDayIndex]?.[0] || null)
          : null;

        const payload: any = {
          doctor: formData.doctor,
          startTime: formData.isRecurring 
            ? (firstTimeRange?.startTime || formData.startTime)
            : formData.startTime,
          endTime: formData.isRecurring
            ? (firstTimeRange?.endTime || formData.endTime)
            : formData.endTime,
          slotDuration: formData.isRecurring
            ? (firstTimeRange?.slotDuration || formData.slotDuration)
            : formData.slotDuration,
          consultationFee: formData.consultationFee || 0,
          isRecurring: formData.isRecurring,
          isActive: formData.isActive,
          effectiveFrom: formData.effectiveFrom || new Date(),
        };

        if (formData.isRecurring) {
          payload.dayOfWeek = firstDayIndex;
        } else {
          payload.specificDate = formData.specificDate;
        }

        if (formData.effectiveUntil) {
          payload.effectiveUntil = formData.effectiveUntil;
        }

        await api.put(`/schedules/${editingSchedule.id || editingSchedule._id}`, payload);
        setSuccess('Schedule updated successfully!');
      } else {
        // For new schedules, create one entry per day-time-slotDuration combination
        if (formData.isRecurring) {
          const promises: Promise<any>[] = [];
          
          // Build all schedule payloads first
          formData.selectedDays.forEach(dayIndex => {
            const dayRanges = formData.daySchedules[dayIndex] || [];
            
            // Create a schedule entry for each time range
            dayRanges.forEach((range) => {
              // Validate that the range has all required fields
              if (!range.startTime || !range.endTime || !range.slotDuration) {
                throw new Error(`Incomplete time range for ${DAYS_OF_WEEK[dayIndex]}`);
              }
              
              const payload: any = {
                doctor: formData.doctor,
                startTime: range.startTime,
                endTime: range.endTime,
                slotDuration: range.slotDuration,
                consultationFee: formData.consultationFee || 0,
                isRecurring: true,
                dayOfWeek: dayIndex,
                isActive: formData.isActive,
                effectiveFrom: formData.effectiveFrom || new Date(),
              };

              if (formData.effectiveUntil) {
                payload.effectiveUntil = formData.effectiveUntil;
              }

              promises.push(api.post('/schedules', payload));
            });
          });

          // Wait for all requests to complete
          const results = await Promise.allSettled(promises);
          const successful = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          
          if (failed > 0) {
            const errors = results
              .filter(r => r.status === 'rejected')
              .map((r: any) => r.reason?.response?.data?.message || r.reason?.message || 'Unknown error')
              .join('; ');
            setError(`Created ${successful} schedule(s), but ${failed} failed: ${errors}`);
          } else {
            setSuccess(`Successfully created ${successful} schedule(s)!`);
          }
        } else {
          // One-time schedule
          const payload: any = {
            doctor: formData.doctor,
            startTime: formData.startTime,
            endTime: formData.endTime,
            slotDuration: formData.slotDuration,
            consultationFee: formData.consultationFee || 0,
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
        [dayOfWeek]: [{
          id: `day-${dayOfWeek}-${Date.now()}`,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          slotDuration: schedule.slotDuration || 30,
        }],
      } : {},
      specificDate: schedule.specificDate
        ? (typeof schedule.specificDate === 'string'
            ? schedule.specificDate.split('T')[0]
            : new Date(schedule.specificDate).toISOString().split('T')[0])
        : '',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      slotDuration: schedule.slotDuration || 30,
      consultationFee: (schedule as any).consultationFee || 0,
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
      daySchedules: {}, // Array of time ranges for each day
      specificDate: '',
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      consultationFee: 0,
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

                <TextField
                  label="Consultation Fee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Consultation fee for this doctor's schedule"
                />

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
                          {formData.selectedDays.map((dayIndex) => {
                            const dayRanges = formData.daySchedules[dayIndex] || [];
                            return (
                              <Paper key={dayIndex} sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {DAYS_OF_WEEK[dayIndex]}
                                  </Typography>
                                  <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddTimeRange(dayIndex)}
                                    variant="outlined"
                                  >
                                    Add Time Range
                                  </Button>
                                </Box>
                                {dayRanges.length === 0 ? (
                                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Click &quot;Add Time Range&quot; to add a schedule for this day
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {dayRanges.map((range, rangeIndex) => (
                                      <Card key={range.id} variant="outlined">
                                        <CardContent>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                              Time Range {rangeIndex + 1}
                                            </Typography>
                                            <IconButton
                                              size="small"
                                              onClick={() => handleRemoveTimeRange(dayIndex, range.id)}
                                              color="error"
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Box>
                                          <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                              <TextField
                                                label="Start Time"
                                                type="time"
                                                value={range.startTime}
                                                onChange={(e) => handleTimeRangeChange(dayIndex, range.id, 'startTime', e.target.value)}
                                                fullWidth
                                                required
                                                size="small"
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ step: 300 }}
                                              />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                              <TextField
                                                label="End Time"
                                                type="time"
                                                value={range.endTime}
                                                onChange={(e) => handleTimeRangeChange(dayIndex, range.id, 'endTime', e.target.value)}
                                                fullWidth
                                                required
                                                size="small"
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ step: 300 }}
                                              />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                              <TextField
                                                label="Slot Duration (min)"
                                                type="number"
                                                value={range.slotDuration}
                                                onChange={(e) => {
                                                  const value = parseInt(e.target.value) || 30;
                                                  const clampedValue = Math.min(Math.max(value, 5), 50);
                                                  handleTimeRangeChange(dayIndex, range.id, 'slotDuration', clampedValue);
                                                }}
                                                fullWidth
                                                required
                                                size="small"
                                                inputProps={{ min: 5, max: 50, step: 5 }}
                                                helperText="5-50 minutes"
                                              />
                                            </Grid>
                                          </Grid>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </Box>
                                )}
                              </Paper>
                            );
                          })}
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
                    
                    {/* Summary of schedules to be created */}
                    {formData.isRecurring && formData.selectedDays.length > 0 && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          Summary: {formData.selectedDays.reduce((sum, dayIndex) => sum + (formData.daySchedules[dayIndex]?.length || 0), 0)} schedule(s) will be created
                        </Typography>
                        {formData.selectedDays.map(dayIndex => {
                          const dayRanges = formData.daySchedules[dayIndex] || [];
                          if (dayRanges.length === 0) return null;
                          return (
                            <Typography key={dayIndex} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                              <strong>{DAYS_OF_WEEK[dayIndex]}:</strong> {dayRanges.length} time range(s) - {dayRanges.map((r, i) => `${r.startTime}-${r.endTime} (${r.slotDuration}min)`).join(', ')}
                            </Typography>
                          );
                        })}
                      </Box>
                    )}
                    
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Default Values (Used when adding new time ranges)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Default Start Time"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Default End Time"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Default Slot Duration (min)"
                          type="number"
                          value={formData.slotDuration}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 30;
                            const clampedValue = Math.min(Math.max(value, 5), 50);
                            setFormData({ ...formData, slotDuration: clampedValue });
                          }}
                          fullWidth
                          size="small"
                          inputProps={{ min: 5, max: 50, step: 5 }}
                          helperText="5-50 minutes"
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
                    formData.selectedDays.some(day => {
                      const dayRanges = formData.daySchedules[day] || [];
                      if (dayRanges.length === 0) return true;
                      return dayRanges.some(range => 
                        !range.startTime || !range.endTime || !range.slotDuration
                      );
                    })
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

