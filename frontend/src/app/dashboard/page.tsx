'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  Science as ScienceIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';

interface DashboardStats {
  appointments: {
    total: number;
    confirmed: number;
    completed: number;
  };
  revenue: {
    total: number;
    paid: number;
    invoices: number;
    paidInvoices: number;
  };
  lab: {
    requests: number;
    completed: number;
  };
  patients?: number;
}

function DashboardContent() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Fetch stats for today
      const statsParams = new URLSearchParams();
      statsParams.append('startDate', today.toISOString().split('T')[0]);
      statsParams.append('endDate', today.toISOString().split('T')[0]);
      
      // For admin/super admin, also get patient count
      if (user?.role === 'Super Admin' || user?.role === 'Admin') {
        const statsResponse = await api.get(`/analytics/dashboard?${statsParams.toString()}`);
        setStats(statsResponse.data.data);
        
        // Fetch patient count
        const patientsResponse = await api.get('/users?role=Patient');
        const patientCount = patientsResponse.data.data.users?.length || 0;
        setStats(prev => prev ? { ...prev, patients: patientCount } : null);
      } else if (user?.role === 'Doctor') {
        // For doctors, fetch their specific stats
        const [appointmentsRes, labRes] = await Promise.all([
          api.get(`/appointments?doctor=${user.id}`).catch(() => ({ data: { data: { appointments: [] } } })),
          api.get(`/lab/requests?doctor=${user.id}`).catch(() => ({ data: { data: { labRequests: [] } } })),
        ]);
        
        const appointments = appointmentsRes.data.data.appointments || [];
        const todayApts = appointments.filter((apt: any) => {
          const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate) : null;
          return aptDate && aptDate >= today && aptDate <= todayEnd;
        });
        
        setStats({
          appointments: {
            total: appointments.length,
            confirmed: appointments.filter((a: any) => a.status === 'Confirmed').length,
            completed: appointments.filter((a: any) => a.status === 'Completed').length,
          },
          revenue: { total: 0, paid: 0, invoices: 0, paidInvoices: 0 },
          lab: {
            requests: labRes.data.data.labRequests?.length || 0,
            completed: 0,
          },
        });
        setTodayAppointments(todayApts);
      } else if (user?.role === 'Patient') {
        // For patients, fetch their specific stats
        const [appointmentsRes, invoicesRes, labRes] = await Promise.all([
          api.get(`/appointments`).catch(() => ({ data: { data: { appointments: [] } } })),
          api.get(`/invoices`).catch(() => ({ data: { data: { invoices: [] } } })),
          api.get(`/lab/requests`).catch(() => ({ data: { data: { labRequests: [] } } })),
        ]);
        
        const appointments = appointmentsRes.data.data.appointments || [];
        const invoices = invoicesRes.data.data.invoices || [];
        const todayApts = appointments.filter((apt: any) => {
          const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate) : null;
          return aptDate && aptDate >= today && aptDate <= todayEnd;
        });
        
        setStats({
          appointments: {
            total: appointments.length,
            confirmed: appointments.filter((a: any) => a.status === 'Confirmed').length,
            completed: appointments.filter((a: any) => a.status === 'Completed').length,
          },
          revenue: { 
            total: invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0),
            paid: invoices.reduce((sum: number, inv: any) => {
              const paid = inv.payments?.filter((p: any) => p.status === 'Completed').reduce((s: number, p: any) => s + (p.amount || 0), 0) || 0;
              return sum + paid;
            }, 0),
            invoices: invoices.length,
            paidInvoices: invoices.filter((inv: any) => inv.status === 'Paid').length,
          },
          lab: {
            requests: labRes.data.data.labRequests?.length || 0,
            completed: 0,
          },
        });
        setTodayAppointments(todayApts);
        setPendingInvoices(invoices.filter((inv: any) => inv.status !== 'Paid' && inv.status !== 'Cancelled'));
      } else {
        // For other roles, fetch basic stats
        const statsResponse = await api.get(`/analytics/dashboard?${statsParams.toString()}`);
        setStats(statsResponse.data.data);
      }

      // Fetch today's appointments
      try {
        const aptParams = new URLSearchParams();
        aptParams.append('startDate', today.toISOString().split('T')[0]);
        aptParams.append('endDate', today.toISOString().split('T')[0]);
        const todayAptsResponse = await api.get(`/appointments?${aptParams.toString()}`);
        const allTodayApts = todayAptsResponse.data.data.appointments || [];
        
        // Filter by role if needed
        if (user?.role === 'Doctor') {
          setTodayAppointments(allTodayApts.filter((apt: any) => {
            const doctorId = typeof apt.doctor === 'object' ? (apt.doctor.id || apt.doctor._id) : apt.doctor;
            return doctorId === user.id;
          }));
        } else if (user?.role !== 'Patient') {
          setTodayAppointments(allTodayApts);
        }
      } catch (err) {
        // Ignore errors for today's appointments
      }

      // Fetch pending invoices (for admin/super admin/receptionist)
      if (user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Receptionist') {
        try {
          const invoicesResponse = await api.get('/invoices?status=Pending');
          setPendingInvoices((invoicesResponse.data.data.invoices || []).slice(0, 5));
        } catch (err) {
          // Ignore errors
        }
      }

      // Fetch recent appointments
      try {
        const recentAptsResponse = await api.get('/appointments');
        const allApts = recentAptsResponse.data.data.appointments || [];
        const sortedApts = allApts
          .sort((a: any, b: any) => {
            const dateA = a.appointmentDate ? new Date(a.appointmentDate) : new Date(0);
            const dateB = b.appointmentDate ? new Date(b.appointmentDate) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);
        
        // Filter by role if needed
        if (user?.role === 'Doctor') {
          setRecentAppointments(sortedApts.filter((apt: any) => {
            const doctorId = typeof apt.doctor === 'object' ? (apt.doctor.id || apt.doctor._id) : apt.doctor;
            return doctorId === user.id;
          }));
        } else {
          setRecentAppointments(sortedApts);
        }
      } catch (err) {
        // Ignore errors
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Build stats array based on user role
  const getStatsCards = () => {
    if (!stats) return [];

    const cards = [];

    if (user?.role === 'Super Admin' || user?.role === 'Admin') {
      cards.push(
        {
          title: 'Total Patients',
          value: stats.patients?.toString() || '0',
          icon: <PeopleIcon sx={{ fontSize: 40 }} />,
          color: '#1976d2',
        },
        {
          title: 'Today\'s Appointments',
          value: todayAppointments.length.toString(),
          icon: <CalendarIcon sx={{ fontSize: 40 }} />,
          color: '#2e7d32',
        },
        {
          title: 'Pending Invoices',
          value: pendingInvoices.length.toString(),
          icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
          color: '#ed6c02',
        },
        {
          title: 'Lab Requests',
          value: stats.lab.requests.toString(),
          icon: <ScienceIcon sx={{ fontSize: 40 }} />,
          color: '#d32f2f',
        }
      );
    } else if (user?.role === 'Doctor') {
      cards.push(
        {
          title: 'My Appointments',
          value: stats.appointments.total.toString(),
          icon: <CalendarIcon sx={{ fontSize: 40 }} />,
          color: '#1976d2',
        },
        {
          title: 'Today\'s Appointments',
          value: todayAppointments.length.toString(),
          icon: <CalendarIcon sx={{ fontSize: 40 }} />,
          color: '#2e7d32',
        },
        {
          title: 'Confirmed',
          value: stats.appointments.confirmed.toString(),
          icon: <CalendarIcon sx={{ fontSize: 40 }} />,
          color: '#9c27b0',
        },
        {
          title: 'Lab Requests',
          value: stats.lab.requests.toString(),
          icon: <ScienceIcon sx={{ fontSize: 40 }} />,
          color: '#d32f2f',
        }
      );
    } else if (user?.role === 'Patient') {
      cards.push(
        {
          title: 'My Appointments',
          value: stats.appointments.total.toString(),
          icon: <CalendarIcon sx={{ fontSize: 40 }} />,
          color: '#1976d2',
        },
        {
          title: 'Today\'s Appointments',
          value: todayAppointments.length.toString(),
          icon: <CalendarIcon sx={{ fontSize: 40 }} />,
          color: '#2e7d32',
        },
        {
          title: 'Pending Invoices',
          value: pendingInvoices.length.toString(),
          icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
          color: '#ed6c02',
        },
        {
          title: 'Lab Tests',
          value: stats.lab.requests.toString(),
          icon: <ScienceIcon sx={{ fontSize: 40 }} />,
          color: '#d32f2f',
        }
      );
    } else {
      cards.push(
        {
          title: 'Today\'s Appointments',
          value: todayAppointments.length.toString(),
          icon: <CalendarIcon sx={{ fontSize: 40 }} />,
          color: '#1976d2',
        },
        {
          title: 'Pending Invoices',
          value: pendingInvoices.length.toString(),
          icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
          color: '#ed6c02',
        },
        {
          title: 'Lab Requests',
          value: stats.lab.requests.toString(),
          icon: <ScienceIcon sx={{ fontSize: 40 }} />,
          color: '#d32f2f',
        },
        {
          title: 'Completed Lab Tests',
          value: stats.lab.completed.toString(),
          icon: <ScienceIcon sx={{ fontSize: 40 }} />,
          color: '#2e7d32',
        }
      );
    }

    return cards;
  };

  const statsCards = getStatsCards();

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return 'success';
      case 'Confirmed':
        return 'primary';
      case 'Pending':
      case 'Scheduled':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Appointments
                  </Typography>
                  {(user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Receptionist' || user?.role === 'Doctor') && (
                    <Button size="small" onClick={() => router.push('/dashboard/appointments')}>
                      View All
                    </Button>
                  )}
                </Box>
                {recentAppointments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No recent appointments
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {recentAppointments.slice(0, 5).map((apt: any) => {
                      const patient = typeof apt.patient === 'object' ? apt.patient : null;
                      const doctor = typeof apt.doctor === 'object' ? apt.doctor : null;
                      const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate) : null;
                      return (
                        <Box key={apt.id || apt._id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                                {doctor && ` - Dr. ${doctor.firstName} ${doctor.lastName}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {aptDate ? aptDate.toLocaleDateString() : 'N/A'} at {apt.appointmentTime || 'N/A'}
                              </Typography>
                            </Box>
                            <Chip label={apt.status || 'N/A'} size="small" color={getStatusColor(apt.status)} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Quick Actions
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {(user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Receptionist') && (
                    <>
                      <Button variant="outlined" fullWidth onClick={() => router.push('/dashboard/appointments')} startIcon={<CalendarIcon />}>
                        Manage Appointments
                      </Button>
                      <Button variant="outlined" fullWidth onClick={() => router.push('/dashboard/billing')} startIcon={<ReceiptIcon />}>
                        Billing & Invoices
                      </Button>
                      <Button variant="outlined" fullWidth onClick={() => router.push('/dashboard/patients')} startIcon={<PeopleIcon />}>
                        View Patients
                      </Button>
                    </>
                  )}
                  {user?.role === 'Doctor' && (
                    <>
                      <Button variant="outlined" fullWidth onClick={() => router.push('/dashboard/my-appointments')} startIcon={<CalendarIcon />}>
                        My Appointments
                      </Button>
                      <Button variant="outlined" fullWidth onClick={() => router.push('/dashboard/medical-records')} startIcon={<AssignmentIcon />}>
                        Medical Records
                      </Button>
                    </>
                  )}
                  {user?.role === 'Patient' && (
                    <>
                      <Button variant="outlined" fullWidth onClick={() => router.push('/dashboard/appointments')} startIcon={<CalendarIcon />}>
                        My Appointments
                      </Button>
                      <Button variant="outlined" fullWidth onClick={() => router.push('/dashboard/profile')} startIcon={<PeopleIcon />}>
                        My Profile
                      </Button>
                      <Button variant="outlined" fullWidth onClick={() => router.push('/dashboard/billing')} startIcon={<ReceiptIcon />}>
                        My Invoices
                      </Button>
                    </>
                  )}
                  {(user?.role === 'Super Admin' || user?.role === 'Admin') && (
                    <Button variant="outlined" fullWidth onClick={() => router.push('/dashboard/reports')} startIcon={<MoneyIcon />}>
                      View Reports
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
