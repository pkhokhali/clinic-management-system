'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface DashboardStats {
  appointments: {
    total: number;
    confirmed: number;
    completed: number;
  };
  revenue: {
    total: number;
    invoices: number;
  };
  lab: {
    requests: number;
    completed: number;
  };
}

interface RevenueInvoice {
  _id: string;
  invoiceNumber: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  total: number;
  invoiceDate: string;
  status: string;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<{
    invoices: RevenueInvoice[];
    totalRevenue: number;
    totalPaid: number;
    count: number;
  } | null>(null);
  
  // Date filters
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reportStartDate, setReportStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [reportEndDate, setReportEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/analytics/dashboard?${params.toString()}`);
      setStats(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch revenue report
  const fetchRevenueReport = async () => {
    try {
      setLoadingReport(true);
      setError(null);
      const params = new URLSearchParams();
      if (reportStartDate) params.append('startDate', reportStartDate);
      if (reportEndDate) params.append('endDate', reportEndDate);
      
      const response = await api.get(`/analytics/revenue?${params.toString()}`);
      setRevenueData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch revenue report');
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
    }).format(amount);
  };

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
      <DashboardLayout>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Reports & Analytics
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Statistics Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Dashboard Statistics
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <Button variant="outlined" onClick={fetchStats}>
                  Refresh
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : stats ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Total Appointments
                          </Typography>
                          <Typography variant="h4">{stats.appointments.total}</Typography>
                        </Box>
                        <CalendarIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Confirmed Appointments
                          </Typography>
                          <Typography variant="h4">{stats.appointments.confirmed}</Typography>
                        </Box>
                        <CalendarIcon sx={{ fontSize: 40, color: 'success.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Total Revenue
                          </Typography>
                          <Typography variant="h4">{formatCurrency(stats.revenue.total)}</Typography>
                        </Box>
                        <MoneyIcon sx={{ fontSize: 40, color: 'success.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Lab Requests
                          </Typography>
                          <Typography variant="h4">{stats.lab.requests}</Typography>
                        </Box>
                        <ScienceIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Completed Appointments
                          </Typography>
                          <Typography variant="h4">{stats.appointments.completed}</Typography>
                        </Box>
                        <AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Paid Invoices
                          </Typography>
                          <Typography variant="h4">{stats.revenue.invoices}</Typography>
                        </Box>
                        <MoneyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Completed Lab Tests
                          </Typography>
                          <Typography variant="h4">{stats.lab.completed}</Typography>
                        </Box>
                        <ScienceIcon sx={{ fontSize: 40, color: 'success.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : null}
          </Paper>

          {/* Revenue Report Section */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Revenue Report
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <Button variant="contained" onClick={fetchRevenueReport} startIcon={loadingReport ? <CircularProgress size={20} /> : <AssessmentIcon />}>
                  Generate Report
                </Button>
              </Box>
            </Box>

            {loadingReport ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : revenueData ? (
              <>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(revenueData.totalRevenue)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">Total Paid</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(revenueData.totalPaid)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">Number of Invoices</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {revenueData.count}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {revenueData.invoices.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Invoice Number</TableCell>
                          <TableCell>Patient</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {revenueData.invoices.map((invoice) => (
                          <TableRow key={invoice._id}>
                            <TableCell>{invoice.invoiceNumber}</TableCell>
                            <TableCell>
                              {invoice.patient?.firstName} {invoice.patient?.lastName}
                            </TableCell>
                            <TableCell>
                              {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>{formatCurrency(invoice.total)}</TableCell>
                            <TableCell>
                              <Chip
                                label={invoice.status}
                                color={invoice.status === 'Paid' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No revenue data found for the selected period</Typography>
                  </Box>
                )}
              </>
            ) : null}
          </Paper>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
