import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    patients: 0,
    invoices: 0,
    labRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch statistics based on user role
      // This is a placeholder - implement based on your needs
      setStats({
        appointments: 0,
        patients: 0,
        invoices: 0,
        labRequests: 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Appointments',
      value: stats.appointments,
      icon: <CalendarIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Patients',
      value: stats.patients,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Invoices',
      value: stats.invoices,
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Lab Requests',
      value: stats.labRequests,
      icon: <ScienceIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        Welcome, {user?.firstName} {user?.lastName}!
      </Typography>

      <Grid container spacing={3}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: `${stat.color}20`,
                      borderRadius: 2,
                      p: 1.5,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Button variant="contained" startIcon={<PeopleIcon />}>
            Manage Patients
          </Button>
          <Button variant="contained" startIcon={<CalendarIcon />}>
            View Appointments
          </Button>
          <Button variant="contained" startIcon={<ReceiptIcon />}>
            Billing
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

