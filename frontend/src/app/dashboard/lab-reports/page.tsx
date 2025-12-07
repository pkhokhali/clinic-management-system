'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import {
  Box,
  Typography,
  Paper,
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
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { User } from '@/types';

interface LabTest {
  _id?: string;
  id?: string;
  name: string;
}

interface LabResult {
  _id?: string;
  id?: string;
  labRequest: string | any;
  test: string | LabTest;
  patient: string | User;
  doctor: string | User;
  technician?: string | User;
  sampleCollectionDate?: Date;
  resultDate: string | Date;
  resultValues: Array<{
    parameterName: string;
    value: string;
    unit?: string;
    normalRange?: string;
    flag: 'Normal' | 'High' | 'Low' | 'Critical';
    comments?: string;
  }>;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Verified' | 'Cancelled';
  comments?: string;
}

export default function LabReportsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  
  // Patient list for filter
  const [patients, setPatients] = useState<User[]>([]);
  
  // Dialog states
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [openResultViewDialog, setOpenResultViewDialog] = useState(false);

  // Fetch lab results (only for assigned patients - handled by backend)
  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (patientFilter !== 'all') {
        params.append('patient', patientFilter);
      }
      
      const response = await api.get(`/lab/results?${params.toString()}`);
      const resultsList = (response.data.data.labResults || []).map((res: any) => ({
        ...res,
        id: res._id || res.id,
      }));
      setResults(resultsList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lab results');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unique patients from results for filter dropdown
  const fetchUniquePatients = () => {
    const uniquePatients = results.reduce((acc: any[], result) => {
      const patient = typeof result.patient === 'object' ? result.patient : null;
      if (patient) {
        const patientId = patient.id || (patient as any)._id;
        if (!acc.find(p => (p.id || p._id) === patientId)) {
          acc.push(patient);
        }
      }
      return acc;
    }, []);
    setPatients(uniquePatients);
  };

  useEffect(() => {
    if (currentUser?.role === 'Doctor') {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, patientFilter]);

  useEffect(() => {
    if (results.length > 0) {
      fetchUniquePatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Filter results
  const filteredResults = results.filter((result) => {
    const matchesSearch = () => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const patient = typeof result.patient === 'object' ? result.patient : null;
      const test = typeof result.test === 'object' ? result.test : null;
      return (
        (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
        (test && test.name.toLowerCase().includes(searchLower))
      );
    };

    return matchesSearch();
  });

  // Get status color
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' => {
    switch (status) {
      case 'Completed':
      case 'Verified':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle view result
  const handleViewResult = (result: LabResult) => {
    setSelectedResult(result);
    setOpenResultViewDialog(true);
  };

  // Get flag color
  const getFlagColor = (flag: string): 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' => {
    switch (flag) {
      case 'Normal':
        return 'success';
      case 'Critical':
        return 'error';
      case 'High':
      case 'Low':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Doctor']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Lab Reports
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Results
                      </Typography>
                      <Typography variant="h4">{results.length}</Typography>
                    </Box>
                    <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                        Completed
                      </Typography>
                      <Typography variant="h4">
                        {results.filter(r => r.status === 'Completed' || r.status === 'Verified').length}
                      </Typography>
                    </Box>
                    <ScienceIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                        Pending
                      </Typography>
                      <Typography variant="h4">
                        {results.filter(r => r.status === 'Pending' || r.status === 'In Progress').length}
                      </Typography>
                    </Box>
                    <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                        My Patients
                      </Typography>
                      <Typography variant="h4">{patients.length}</Typography>
                    </Box>
                    <ScienceIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search by patient name or test name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, minWidth: 250 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Verified">Verified</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={patientFilter}
                  label="Patient"
                  onChange={(e) => setPatientFilter(e.target.value)}
                >
                  <MenuItem value="all">All Patients</MenuItem>
                  {patients.map((patient) => (
                    <MenuItem key={patient.id || (patient as any)._id} value={patient.id || (patient as any)._id}>
                      {patient.firstName} {patient.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Lab Results Table */}
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredResults.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No lab results found</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Test</TableCell>
                    <TableCell>Result Date</TableCell>
                    <TableCell>Sample Collection Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.map((result) => {
                    const patient = typeof result.patient === 'object' ? result.patient : null;
                    const test = typeof result.test === 'object' ? result.test : null;
                    const resultDate = result.resultDate
                      ? (typeof result.resultDate === 'string' ? new Date(result.resultDate) : result.resultDate)
                      : null;
                    const sampleDate = result.sampleCollectionDate
                      ? (typeof result.sampleCollectionDate === 'string' ? new Date(result.sampleCollectionDate) : result.sampleCollectionDate)
                      : null;

                    return (
                      <TableRow key={result.id || result._id} hover>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>{test ? test.name : 'N/A'}</TableCell>
                        <TableCell>
                          {resultDate ? resultDate.toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {sampleDate ? sampleDate.toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.status}
                            color={getStatusColor(result.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewResult(result)}
                              color="primary"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* View Result Dialog */}
          <Dialog open={openResultViewDialog} onClose={() => setOpenResultViewDialog(false)} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle>Lab Result Details</DialogTitle>
            <DialogContent>
              {selectedResult && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {typeof selectedResult.patient === 'object'
                          ? `${selectedResult.patient.firstName} ${selectedResult.patient.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Test</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {typeof selectedResult.test === 'object'
                          ? selectedResult.test.name
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Result Date</Typography>
                      <Typography variant="body1">
                        {selectedResult.resultDate
                          ? new Date(selectedResult.resultDate).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Sample Collection Date</Typography>
                      <Typography variant="body1">
                        {selectedResult.sampleCollectionDate
                          ? new Date(selectedResult.sampleCollectionDate).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedResult.status}
                        color={getStatusColor(selectedResult.status)}
                        size="small"
                      />
                    </Grid>
                    {selectedResult.technician && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Technician</Typography>
                        <Typography variant="body1">
                          {typeof selectedResult.technician === 'object'
                            ? `${selectedResult.technician.firstName} ${selectedResult.technician.lastName}`
                            : 'N/A'}
                        </Typography>
                      </Grid>
                    )}
                    {selectedResult.resultValues && selectedResult.resultValues.length > 0 && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="h6" sx={{ mb: 2 }}>Test Results</Typography>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Parameter</TableCell>
                                  <TableCell>Value</TableCell>
                                  <TableCell>Unit</TableCell>
                                  <TableCell>Normal Range</TableCell>
                                  <TableCell>Flag</TableCell>
                                  {selectedResult.resultValues.some((v: any) => v.comments) && (
                                    <TableCell>Comments</TableCell>
                                  )}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedResult.resultValues.map((value, index) => (
                                  <TableRow key={index}>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{value.parameterName}</TableCell>
                                    <TableCell>
                                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {value.value}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>{value.unit || '-'}</TableCell>
                                    <TableCell>{value.normalRange || '-'}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={value.flag}
                                        color={getFlagColor(value.flag)}
                                        size="small"
                                      />
                                    </TableCell>
                                    {selectedResult.resultValues.some((v: any) => v.comments) && (
                                      <TableCell>{value.comments || '-'}</TableCell>
                                    )}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      </>
                    )}
                    {selectedResult.comments && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Comments</Typography>
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {selectedResult.comments}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenResultViewDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

