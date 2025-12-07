'use client';

import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import { Box, Typography, Paper } from '@mui/material';

export default function BillingPage() {
  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Receptionist']}>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Billing
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Billing management page - Coming soon
            </Typography>
          </Paper>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

