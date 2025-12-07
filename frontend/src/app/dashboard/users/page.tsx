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
  Divider,
  Tabs,
  Tab,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { User } from '@/types';
import {
  loadMandatoryFieldsConfig,
  saveMandatoryFieldsConfig,
  resetToDefaultConfig,
  isFieldMandatory,
  getFieldsForRole,
  type MandatoryFieldsConfig,
} from '@/utils/mandatoryFieldsConfig';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  isActive: boolean;
  // Doctor & Patient fields
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  // Doctor specific
  specialization?: string;
  licenseNumber?: string;
  // Patient specific
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}

export default function UsersManagementPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'Patient',
    isActive: true,
    dateOfBirth: '',
    gender: undefined,
    specialization: '',
    licenseNumber: '',
    bloodGroup: undefined,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Mandatory fields configuration
  const [mandatoryFieldsConfig, setMandatoryFieldsConfig] = useState<MandatoryFieldsConfig>(() => loadMandatoryFieldsConfig());
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [configTab, setConfigTab] = useState(0);
  const roles = ['Super Admin', 'Admin', 'Doctor', 'Receptionist', 'Lab Technician', 'Patient'];

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      
      const response = await api.get(`/users?${params.toString()}`);
      // Map backend _id to id for frontend compatibility
      const usersList = (response.data.data.users || []).map((user: any) => ({
        ...user,
        id: user._id || user.id,
      }));
      setUsers(usersList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  // Filter users by search term
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm)
    );
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Build request payload with role-specific fields
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Add role-specific required fields
      if (formData.role === 'Doctor' || formData.role === 'Patient') {
        if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
        if (formData.gender) payload.gender = formData.gender;
      }

      // Doctor-specific fields
      if (formData.role === 'Doctor') {
        if (formData.specialization) payload.specialization = formData.specialization;
        if (formData.licenseNumber) payload.licenseNumber = formData.licenseNumber;
      }

      // Patient-specific fields
      if (formData.role === 'Patient') {
        if (formData.bloodGroup) payload.bloodGroup = formData.bloodGroup;
      }

      if (editingUser) {
        // Update existing user
        if (formData.password) payload.password = formData.password;
        await api.put(`/users/${editingUser.id}`, payload);
        setSuccess('User updated successfully!');
      } else {
        // Create new user
        payload.password = formData.password || 'Default@123';
        await api.post('/users', payload);
        setSuccess('User created successfully!');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }
    
    try {
      await api.delete(`/users/${userId}`);
      setSuccess('User deactivated successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'Patient',
      isActive: user.isActive !== false,
      dateOfBirth: user.dateOfBirth ? (typeof user.dateOfBirth === 'string' ? user.dateOfBirth.split('T')[0] : new Date(user.dateOfBirth).toISOString().split('T')[0]) : '',
      gender: user.gender as 'Male' | 'Female' | 'Other' | undefined,
      specialization: user.specialization || '',
      licenseNumber: user.licenseNumber || '',
      bloodGroup: user.bloodGroup as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | undefined,
    });
    setOpenDialog(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingUser(null);
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
      role: 'Patient',
      isActive: true,
      dateOfBirth: '',
      gender: undefined,
      specialization: '',
      licenseNumber: '',
      bloodGroup: undefined,
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    resetForm();
    setError(null);
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'Super Admin': 'error',
      'Admin': 'warning',
      'Doctor': 'primary',
      'Receptionist': 'secondary',
      'Lab Technician': 'default',
      'Patient': 'success',
    };
    return colors[role] || 'default';
  };

  // Handle mandatory fields configuration
  const handleOpenConfigDialog = () => {
    setOpenConfigDialog(true);
  };

  const handleCloseConfigDialog = () => {
    setOpenConfigDialog(false);
    setConfigTab(0);
  };

  const handleSaveConfig = () => {
    saveMandatoryFieldsConfig(mandatoryFieldsConfig);
    setSuccess('Mandatory fields configuration saved successfully!');
    setOpenConfigDialog(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleResetConfig = () => {
    if (window.confirm('Are you sure you want to reset to default configuration?')) {
      const defaultConfig = resetToDefaultConfig();
      setMandatoryFieldsConfig(defaultConfig);
      setSuccess('Configuration reset to defaults!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const toggleFieldMandatory = (role: string, field: string) => {
    setMandatoryFieldsConfig((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: !prev[role]?.[field],
      },
    }));
  };

  // Check if a field is mandatory for the current role
  const isMandatory = (field: string): boolean => {
    return isFieldMandatory(formData.role, field, mandatoryFieldsConfig);
  };

  // Validate form based on mandatory fields configuration
  const isFormValid = (): boolean => {
    if (submitting) return false;
    
    const config = mandatoryFieldsConfig[formData.role] || {};
    
    // Check all mandatory fields
    if (config.firstName && !formData.firstName) return false;
    if (config.lastName && !formData.lastName) return false;
    if (config.email && !formData.email) return false;
    if (config.phone && !formData.phone) return false;
    if (!editingUser && config.password && !formData.password) return false;
    
    // Role-specific mandatory fields
    if (formData.role === 'Doctor' || formData.role === 'Patient') {
      if (config.dateOfBirth && !formData.dateOfBirth) return false;
      if (config.gender && !formData.gender) return false;
    }
    
    if (formData.role === 'Doctor') {
      if (config.specialization && !formData.specialization) return false;
      if (config.licenseNumber && !formData.licenseNumber) return false;
    }
    
    if (formData.role === 'Patient') {
      if (config.bloodGroup && !formData.bloodGroup) return false;
    }
    
    return true;
  };

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Users Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentUser?.role === 'Super Admin' && (
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={handleOpenConfigDialog}
                >
                  Configure Fields
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
              >
                Add New User
              </Button>
            </Box>
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
                sx={{ flexGrow: 1, minWidth: 300 }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Filter by Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="Super Admin">Super Admin</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Doctor">Doctor</MenuItem>
                  <MenuItem value="Receptionist">Receptionist</MenuItem>
                  <MenuItem value="Lab Technician">Lab Technician</MenuItem>
                  <MenuItem value="Patient">Patient</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Users Table */}
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No users found</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive !== false ? 'Active' : 'Inactive'}
                          color={user.isActive !== false ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(user)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {user.id !== currentUser?.id && (
                          <Tooltip title="Deactivate">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(user.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* Add/Edit Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth scroll="paper">
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                <TextField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required={isMandatory('firstName')}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required={isMandatory('lastName')}
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required={isMandatory('email')}
                  fullWidth
                  disabled={!!editingUser}
                />
                <TextField
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required={isMandatory('phone')}
                  fullWidth
                  inputProps={{ maxLength: 10 }}
                />
                <FormControl fullWidth required={isMandatory('role')}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <MenuItem value="Super Admin">Super Admin</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Doctor">Doctor</MenuItem>
                    <MenuItem value="Receptionist">Receptionist</MenuItem>
                    <MenuItem value="Lab Technician">Lab Technician</MenuItem>
                    <MenuItem value="Patient">Patient</MenuItem>
                  </Select>
                </FormControl>

                {/* Doctor & Patient Fields - Date of Birth */}
                {(formData.role === 'Doctor' || formData.role === 'Patient') && (
                  <TextField
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required={isMandatory('dateOfBirth')}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}

                {/* Doctor & Patient Fields - Gender */}
                {(formData.role === 'Doctor' || formData.role === 'Patient') && (
                  <FormControl fullWidth required={isMandatory('gender')}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender || ''}
                      label="Gender"
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {/* Doctor Specific Fields */}
                {formData.role === 'Doctor' && (
                  <>
                    <TextField
                      label="Specialization"
                      value={formData.specialization || ''}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      required={isMandatory('specialization')}
                      fullWidth
                      placeholder="e.g., Cardiology, Pediatrics"
                    />
                    <TextField
                      label="License Number"
                      value={formData.licenseNumber || ''}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      required={isMandatory('licenseNumber')}
                      fullWidth
                      placeholder="Medical license number"
                    />
                  </>
                )}

                {/* Patient Specific Fields */}
                {formData.role === 'Patient' && (
                  <FormControl fullWidth required={isMandatory('bloodGroup')}>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={formData.bloodGroup || ''}
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
                )}

                <TextField
                  label={editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  fullWidth
                  required={!editingUser && isMandatory('password')}
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
                disabled={!isFormValid()}
              >
                {submitting ? <CircularProgress size={24} /> : editingUser ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Mandatory Fields Configuration Dialog */}
          {currentUser?.role === 'Super Admin' && (
            <Dialog open={openConfigDialog} onClose={handleCloseConfigDialog} maxWidth="md" fullWidth scroll="paper">
              <DialogTitle>
                Configure Mandatory Fields for User Creation
              </DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2 }}>
                  <Tabs value={configTab} onChange={(e, newValue) => setConfigTab(newValue)} sx={{ mb: 3 }}>
                    {roles.map((role) => (
                      <Tab key={role} label={role} />
                    ))}
                  </Tabs>
                  
                  {roles.map((role, index) => (
                    <Box key={role} sx={{ display: configTab === index ? 'block' : 'none' }}>
                      <Typography variant="h6" gutterBottom>
                        {role} - Mandatory Fields
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Toggle fields to make them mandatory or optional when creating users with this role.
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {getFieldsForRole(role).map((field) => (
                          <FormControlLabel
                            key={field.key}
                            control={
                              <Checkbox
                                checked={mandatoryFieldsConfig[role]?.[field.key] ?? false}
                                onChange={() => toggleFieldMandatory(role, field.key)}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1">{field.label}</Typography>
                                {mandatoryFieldsConfig[role]?.[field.key] && (
                                  <Chip label="Mandatory" color="primary" size="small" sx={{ ml: 1, mt: 0.5 }} />
                                )}
                              </Box>
                            }
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleResetConfig} color="warning">
                  Reset to Defaults
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleCloseConfigDialog}>Cancel</Button>
                <Button onClick={handleSaveConfig} variant="contained">
                  Save Configuration
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

