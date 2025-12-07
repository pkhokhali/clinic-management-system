'use client';

import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import { Box, Typography, Paper } from '@mui/material';

export default function LaboratoryPage() {
  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Doctor', 'Lab Technician']}>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Laboratory
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Laboratory management page - Coming soon
            </Typography>
          </Paper>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

