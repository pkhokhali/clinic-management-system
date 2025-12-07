'use client';

import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import { Box, Typography, Paper } from '@mui/material';

export default function AppointmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Receptionist', 'Doctor', 'Patient']}>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Appointments
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Appointments management page - Coming soon
            </Typography>
          </Paper>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

