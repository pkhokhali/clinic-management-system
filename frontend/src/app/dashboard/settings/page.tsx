'use client';

import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import { Box, Typography, Paper } from '@mui/material';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Settings
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Settings page - Coming soon
            </Typography>
          </Paper>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

