'use client';

import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import { Box, Typography, Paper } from '@mui/material';

export default function ReportsPage() {
  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Reports
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Reports and analytics page - Coming soon
            </Typography>
          </Paper>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

