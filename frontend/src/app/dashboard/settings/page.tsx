'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout, setUser } from '@/store/slices/authSlice';
import api from '@/lib/api';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '' as 'Male' | 'Female' | 'Other' | '',
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        const user = response.data.data.user;
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth ? (typeof user.dateOfBirth === 'string' ? user.dateOfBirth.split('T')[0] : new Date(user.dateOfBirth).toISOString().split('T')[0]) : '',
          gender: user.gender || '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await api.put(`/users/${currentUser?.id}`, profileData);
      
      // Update Redux store with new user data
      dispatch(setUser(response.data.data.user));
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        setSaving(false);
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        setSaving(false);
        return;
      }

      const response = await api.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Update token in Redux store
      if (response.data.data.token) {
        dispatch(setUser({ ...currentUser, token: response.data.data.token } as any));
      }

      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Settings
          </Typography>

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

          <Grid container spacing={3}>
            {/* Profile Settings */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <PersonIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Profile Information
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Email"
                      value={currentUser?.email || ''}
                      fullWidth
                      disabled
                      helperText="Email cannot be changed"
                    />
                    <TextField
                      label="Phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      fullWidth
                      inputProps={{ maxLength: 10 }}
                    />
                    {(currentUser?.role === 'Doctor' || currentUser?.role === 'Patient') && (
                      <>
                        <TextField
                          label="Date of Birth"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Gender"
                          value={profileData.gender}
                          onChange={(e) => setProfileData({ ...profileData, gender: e.target.value as typeof profileData.gender })}
                          fullWidth
                          select
                          SelectProps={{ native: true }}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </TextField>
                      </>
                    )}

                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleProfileUpdate}
                      disabled={saving || !profileData.firstName || !profileData.lastName}
                      sx={{ mt: 2 }}
                    >
                      Update Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Password Settings */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LockIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      Change Password
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Current Password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      fullWidth
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                              edge="end"
                            >
                              {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="New Password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      fullWidth
                      required
                      helperText="Password must be at least 6 characters"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                              edge="end"
                            >
                              {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Confirm New Password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      fullWidth
                      required
                      error={passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword}
                      helperText={
                        passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword
                          ? 'Passwords do not match'
                          : ''
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                              edge="end"
                            >
                              {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handlePasswordUpdate}
                      disabled={
                        saving ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword ||
                        passwordData.newPassword !== passwordData.confirmPassword ||
                        passwordData.newPassword.length < 6
                      }
                      sx={{ mt: 2 }}
                    >
                      Update Password
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
