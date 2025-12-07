'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/middleware/auth.middleware';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  Alert,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Science as ScienceIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { User } from '@/types';

interface LabTest {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description?: string;
  parameters?: Array<{
    name: string;
    unit?: string;
    normalRange?: string;
    description?: string;
  }>;
  cost: number;
  preparation?: string;
  duration?: number;
  isActive: boolean;
}

interface LabRequest {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  appointment?: string | any;
  tests: Array<{
    test: string | LabTest;
    notes?: string;
  }>;
  orderDate: string | Date;
  status: 'Pending' | 'Sample Collected' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Routine' | 'Urgent' | 'Stat';
  instructions?: string;
}

interface LabResult {
  _id?: string;
  id?: string;
  labRequest: string | LabRequest;
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

export default function LaboratoryPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  
  // Lab Tests state
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  
  // Lab Requests state
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  
  // Lab Results state
  const [results, setResults] = useState<LabResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  
  // Data for forms
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Dialog states - Tests
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [testFormData, setTestFormData] = useState({
    name: '',
    category: '',
    description: '',
    cost: 0,
    preparation: '',
    duration: 24,
    isActive: true,
  });
  const [submittingTest, setSubmittingTest] = useState(false);
  
  // Dialog states - Requests
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openRequestViewDialog, setOpenRequestViewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [requestFormData, setRequestFormData] = useState({
    patient: '',
    doctor: currentUser?.role === 'Doctor' ? (currentUser.id || '') : '',
    appointment: '',
    tests: [] as Array<{ test: string; notes: string }>,
    priority: 'Routine' as 'Routine' | 'Urgent' | 'Stat',
    instructions: '',
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  
  // Dialog states - Results
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [openResultViewDialog, setOpenResultViewDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [resultFormData, setResultFormData] = useState({
    labRequest: '',
    test: '',
    patient: '',
    doctor: '',
    sampleCollectionDate: '',
    resultValues: [] as Array<{
      parameterName: string;
      value: string;
      unit: string;
      normalRange: string;
      flag: 'Normal' | 'High' | 'Low' | 'Critical';
      comments: string;
    }>,
    status: 'Pending' as 'Pending' | 'In Progress' | 'Completed' | 'Verified' | 'Cancelled',
    comments: '',
  });
  const [submittingResult, setSubmittingResult] = useState(false);

  // Fetch lab tests
  const fetchTests = async () => {
    try {
      setLoadingTests(true);
      setError(null);
      const response = await api.get('/lab/tests');
      const testsList = (response.data.data.labTests || []).map((test: any) => ({
        ...test,
        id: test._id || test.id,
      }));
      setTests(testsList.filter((t: LabTest) => t.isActive !== false));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lab tests');
    } finally {
      setLoadingTests(false);
    }
  };

  // Fetch lab requests
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (patientFilter !== 'all') {
        params.append('patient', patientFilter);
      }
      
      const response = await api.get(`/lab/requests?${params.toString()}`);
      const requestsList = (response.data.data.labRequests || []).map((req: any) => ({
        ...req,
        id: req._id || req.id,
      }));
      setRequests(requestsList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lab requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch lab results
  const fetchResults = async () => {
    try {
      setLoadingResults(true);
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
      setLoadingResults(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const response = await api.get('/users?role=Patient');
      const patientsList = (response.data.data.users || []).map((user: any) => ({
        ...user,
        id: user._id || user.id,
      }));
      setPatients(patientsList);
    } catch (err: any) {
      console.error('Failed to fetch patients:', err);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const response = await api.get('/users?role=Doctor');
      const doctorsList = (response.data.data.users || []).map((user: any) => ({
        ...user,
        id: user._id || user.id,
      }));
      setDoctors(doctorsList);
    } catch (err: any) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  // Fetch appointments
  const fetchAppointments = async (patientId: string) => {
    try {
      const response = await api.get(`/appointments?patient=${patientId}`);
      const appointmentsList = (response.data.data.appointments || []).map((apt: any) => ({
        ...apt,
        id: apt._id || apt.id,
      }));
      setAppointments(appointmentsList);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  useEffect(() => {
    fetchTests();
    if (currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') {
      fetchPatients();
    }
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      fetchRequests();
    } else if (tabValue === 2) {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, statusFilter, patientFilter]);

  useEffect(() => {
    if (requestFormData.patient) {
      fetchAppointments(requestFormData.patient);
    } else {
      setAppointments([]);
    }
  }, [requestFormData.patient]);

  // Filter tests
  const filteredTests = tests.filter((test) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      test.name.toLowerCase().includes(searchLower) ||
      test.category.toLowerCase().includes(searchLower) ||
      test.description?.toLowerCase().includes(searchLower)
    );
  });

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const searchLower = searchTerm.toLowerCase();
    const patient = typeof req.patient === 'object' ? req.patient : null;
    const doctor = typeof req.doctor === 'object' ? req.doctor : null;
    
    return (
      (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
      (doctor && `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchLower)) ||
      req.tests.some(t => {
        const test = typeof t.test === 'object' ? t.test : null;
        return test && test.name.toLowerCase().includes(searchLower);
      })
    );
  });

  // Filter results
  const filteredResults = results.filter((res) => {
    const searchLower = searchTerm.toLowerCase();
    const patient = typeof res.patient === 'object' ? res.patient : null;
    const test = typeof res.test === 'object' ? res.test : null;
    
    return (
      (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
      (test && test.name.toLowerCase().includes(searchLower))
    );
  });

  // Handle test submission
  const handleTestSubmit = async () => {
    try {
      setSubmittingTest(true);
      setError(null);
      
      if (editingTest) {
        await api.put(`/lab/tests/${editingTest.id || editingTest._id}`, testFormData);
        setSuccess('Lab test updated successfully!');
      } else {
        await api.post('/lab/tests', testFormData);
        setSuccess('Lab test created successfully!');
      }
      
      setOpenTestDialog(false);
      resetTestForm();
      fetchTests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lab test');
    } finally {
      setSubmittingTest(false);
    }
  };

  // Handle request submission
  const handleRequestSubmit = async () => {
    try {
      setSubmittingRequest(true);
      setError(null);
      
      if (requestFormData.tests.length === 0) {
        setError('Please add at least one test');
        setSubmittingRequest(false);
        return;
      }
      
      const payload: any = {
        patient: requestFormData.patient,
        doctor: requestFormData.doctor,
        tests: requestFormData.tests.map(t => ({
          test: t.test,
          notes: t.notes,
        })),
        priority: requestFormData.priority,
        instructions: requestFormData.instructions,
      };
      
      if (requestFormData.appointment) {
        payload.appointment = requestFormData.appointment;
      }
      
      await api.post('/lab/requests', payload);
      setSuccess('Lab request created successfully!');
      setOpenRequestDialog(false);
      resetRequestForm();
      fetchRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create lab request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Add test to request
  const handleAddTestToRequest = () => {
    const selectedTest = tests.find(t => t.id === requestFormData.tests.find(t2 => t2.test === (t.id || t._id))?.test);
    if (!selectedTest) {
      setError('Please select a test first');
      return;
    }
    
    const testId = selectedTest.id || selectedTest._id || '';
    if (!requestFormData.tests.find(t => t.test === testId)) {
      setRequestFormData({
        ...requestFormData,
        tests: [...requestFormData.tests, { test: testId, notes: '' }],
      });
    }
  };

  // Remove test from request
  const handleRemoveTestFromRequest = (index: number) => {
    setRequestFormData({
      ...requestFormData,
      tests: requestFormData.tests.filter((_, i) => i !== index),
    });
  };

  // Reset forms
  const resetTestForm = () => {
    setTestFormData({
      name: '',
      category: '',
      description: '',
      cost: 0,
      preparation: '',
      duration: 24,
      isActive: true,
    });
    setEditingTest(null);
  };

  const resetRequestForm = () => {
    setRequestFormData({
      patient: '',
      doctor: currentUser?.role === 'Doctor' ? (currentUser.id || '') : '',
      appointment: '',
      tests: [],
      priority: 'Routine',
      instructions: '',
    });
  };

  // View request
  const handleViewRequest = (request: LabRequest) => {
    setSelectedRequest(request);
    setOpenRequestViewDialog(true);
  };

  // View result
  const handleViewResult = (result: LabResult) => {
    setSelectedResult(result);
    setOpenResultViewDialog(true);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'Pending': 'warning',
      'Sample Collected': 'primary',
      'In Progress': 'secondary',
      'Completed': 'success',
      'Cancelled': 'error',
      'Verified': 'success',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' } = {
      'Routine': 'default',
      'Urgent': 'warning',
      'Stat': 'error',
    };
    return colors[priority] || 'default';
  };

  const canManageTests = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Lab Technician';
  const canCreateRequest = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Doctor' || currentUser?.role === 'Receptionist';

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Doctor', 'Lab Technician']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Laboratory Management
            </Typography>
            {canManageTests && tabValue === 0 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetTestForm();
                  setOpenTestDialog(true);
                }}
              >
                Add Lab Test
              </Button>
            )}
            {canCreateRequest && tabValue === 1 && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetRequestForm();
                  setOpenRequestDialog(true);
                }}
              >
                Create Lab Request
              </Button>
            )}
          </Box>

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

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab icon={<ScienceIcon />} iconPosition="start" label="Lab Tests" />
              <Tab icon={<AssignmentIcon />} iconPosition="start" label="Lab Requests" />
              <Tab icon={<AssessmentIcon />} iconPosition="start" label="Lab Results" />
            </Tabs>
          </Paper>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, minWidth: 300 }}
              />
              {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && tabValue > 0 && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Patient</InputLabel>
                  <Select
                    value={patientFilter}
                    label="Filter by Patient"
                    onChange={(e) => setPatientFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Patients</MenuItem>
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {tabValue > 0 && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Filter by Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    {tabValue === 1 && (
                      <>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Sample Collected">Sample Collected</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </>
                    )}
                    {tabValue === 2 && (
                      <>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Verified">Verified</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Paper>

          {/* Lab Tests Tab */}
          {tabValue === 0 && (
            <TableContainer component={Paper}>
              {loadingTests ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredTests.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No lab tests found</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Test Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Cost</TableCell>
                      <TableCell>Duration (hours)</TableCell>
                      <TableCell>Status</TableCell>
                      {canManageTests && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTests.map((test) => (
                      <TableRow key={test.id || test._id} hover>
                        <TableCell>{test.name}</TableCell>
                        <TableCell>{test.category}</TableCell>
                        <TableCell>NPR {test.cost}</TableCell>
                        <TableCell>{test.duration || 24}</TableCell>
                        <TableCell>
                          <Chip
                            label={test.isActive ? 'Active' : 'Inactive'}
                            color={test.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        {canManageTests && (
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingTest(test);
                                  setTestFormData({
                                    name: test.name,
                                    category: test.category,
                                    description: test.description || '',
                                    cost: test.cost,
                                    preparation: test.preparation || '',
                                    duration: test.duration || 24,
                                    isActive: test.isActive !== false,
                                  });
                                  setOpenTestDialog(true);
                                }}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          )}

          {/* Lab Requests Tab */}
          {tabValue === 1 && (
            <TableContainer component={Paper}>
              {loadingRequests ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredRequests.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No lab requests found</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Tests</TableCell>
                      <TableCell>Order Date</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests.map((request) => {
                      const patient = typeof request.patient === 'object' ? request.patient : null;
                      const doctor = typeof request.doctor === 'object' ? request.doctor : null;
                      const orderDate = request.orderDate
                        ? (typeof request.orderDate === 'string' ? new Date(request.orderDate) : request.orderDate)
                        : null;

                      return (
                        <TableRow key={request.id || request._id} hover>
                          <TableCell>
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>{request.tests.length} test(s)</TableCell>
                          <TableCell>
                            {orderDate ? orderDate.toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.priority}
                              color={getPriorityColor(request.priority)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={request.status}
                              color={getStatusColor(request.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewRequest(request)}
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
          )}

          {/* Lab Results Tab */}
          {tabValue === 2 && (
            <TableContainer component={Paper}>
              {loadingResults ? (
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

                      return (
                        <TableRow key={result.id || result._id} hover>
                          <TableCell>
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>{test ? test.name : 'N/A'}</TableCell>
                          <TableCell>
                            {resultDate ? resultDate.toLocaleDateString() : 'N/A'}
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
          )}

          {/* Add/Edit Lab Test Dialog */}
          {canManageTests && (
            <Dialog open={openTestDialog} onClose={() => { setOpenTestDialog(false); resetTestForm(); }} maxWidth="sm" fullWidth>
              <DialogTitle>{editingTest ? 'Edit Lab Test' : 'Add Lab Test'}</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  <TextField
                    label="Test Name"
                    value={testFormData.name}
                    onChange={(e) => setTestFormData({ ...testFormData, name: e.target.value })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Category"
                    value={testFormData.category}
                    onChange={(e) => setTestFormData({ ...testFormData, category: e.target.value })}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Description"
                    value={testFormData.description}
                    onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <TextField
                    label="Cost (NPR)"
                    type="number"
                    value={testFormData.cost}
                    onChange={(e) => setTestFormData({ ...testFormData, cost: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                  <TextField
                    label="Duration (hours)"
                    type="number"
                    value={testFormData.duration}
                    onChange={(e) => setTestFormData({ ...testFormData, duration: parseInt(e.target.value) || 24 })}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    label="Preparation Instructions"
                    value={testFormData.preparation}
                    onChange={(e) => setTestFormData({ ...testFormData, preparation: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={testFormData.isActive}
                        onChange={(e) => setTestFormData({ ...testFormData, isActive: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenTestDialog(false); resetTestForm(); }} disabled={submittingTest}>
                  Cancel
                </Button>
                <Button
                  onClick={handleTestSubmit}
                  variant="contained"
                  disabled={submittingTest || !testFormData.name || !testFormData.category}
                >
                  {submittingTest ? <CircularProgress size={24} /> : editingTest ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Create Lab Request Dialog */}
          {canCreateRequest && (
            <Dialog open={openRequestDialog} onClose={() => { setOpenRequestDialog(false); resetRequestForm(); }} maxWidth="md" fullWidth scroll="paper">
              <DialogTitle>Create Lab Request</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Receptionist') && (
                    <FormControl fullWidth required>
                      <InputLabel>Patient</InputLabel>
                      <Select
                        value={requestFormData.patient}
                        label="Patient"
                        onChange={(e) => setRequestFormData({ ...requestFormData, patient: e.target.value, appointment: '' })}
                      >
                        {patients.map((patient) => (
                          <MenuItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} ({patient.email})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <FormControl fullWidth required>
                    <InputLabel>Doctor</InputLabel>
                    <Select
                      value={requestFormData.doctor}
                      label="Doctor"
                      onChange={(e) => setRequestFormData({ ...requestFormData, doctor: e.target.value })}
                      disabled={currentUser?.role === 'Doctor'}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Appointment (Optional)</InputLabel>
                    <Select
                      value={requestFormData.appointment}
                      label="Appointment (Optional)"
                      onChange={(e) => setRequestFormData({ ...requestFormData, appointment: e.target.value })}
                      disabled={!requestFormData.patient}
                    >
                      <MenuItem value="">None</MenuItem>
                      {appointments.map((apt) => (
                        <MenuItem key={apt.id} value={apt.id}>
                          {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Divider />
                  <Typography variant="h6">Select Tests</Typography>
                  <FormControl fullWidth>
                    <InputLabel>Test</InputLabel>
                    <Select
                      value=""
                      label="Test"
                      onChange={(e) => {
                        const testId = e.target.value;
                        if (testId && !requestFormData.tests.find(t => t.test === testId)) {
                          setRequestFormData({
                            ...requestFormData,
                            tests: [...requestFormData.tests, { test: testId, notes: '' }],
                          });
                        }
                      }}
                    >
                      {tests.filter(t => t.isActive !== false).map((test) => (
                        <MenuItem key={test.id || test._id} value={test.id || test._id}>
                          {test.name} - {test.category} (NPR {test.cost})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {requestFormData.tests.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Tests:</Typography>
                      {requestFormData.tests.map((testItem, index) => {
                        const test = tests.find(t => (t.id || t._id) === testItem.test);
                        return (
                          <Card key={index} sx={{ mb: 1 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {test?.name || 'Unknown Test'}
                                  </Typography>
                                  <TextField
                                    label="Notes (Optional)"
                                    value={testItem.notes}
                                    onChange={(e) => {
                                      const newTests = [...requestFormData.tests];
                                      newTests[index].notes = e.target.value;
                                      setRequestFormData({ ...requestFormData, tests: newTests });
                                    }}
                                    fullWidth
                                    size="small"
                                    sx={{ mt: 1 }}
                                    multiline
                                    rows={1}
                                  />
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveTestFromRequest(index)}
                                  color="error"
                                  sx={{ ml: 1 }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Box>
                  )}
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={requestFormData.priority}
                      label="Priority"
                      onChange={(e) => setRequestFormData({ ...requestFormData, priority: e.target.value as typeof requestFormData.priority })}
                    >
                      <MenuItem value="Routine">Routine</MenuItem>
                      <MenuItem value="Urgent">Urgent</MenuItem>
                      <MenuItem value="Stat">Stat</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Instructions (Optional)"
                    value={requestFormData.instructions}
                    onChange={(e) => setRequestFormData({ ...requestFormData, instructions: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenRequestDialog(false); resetRequestForm(); }} disabled={submittingRequest}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestSubmit}
                  variant="contained"
                  disabled={submittingRequest || !requestFormData.patient || !requestFormData.doctor || requestFormData.tests.length === 0}
                >
                  {submittingRequest ? <CircularProgress size={24} /> : 'Create Request'}
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* View Request Dialog */}
          <Dialog open={openRequestViewDialog} onClose={() => setOpenRequestViewDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Lab Request Details</DialogTitle>
            <DialogContent>
              {selectedRequest && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
                      <Typography variant="body1">
                        {typeof selectedRequest.patient === 'object'
                          ? `${selectedRequest.patient.firstName} ${selectedRequest.patient.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Doctor</Typography>
                      <Typography variant="body1">
                        {typeof selectedRequest.doctor === 'object'
                          ? `Dr. ${selectedRequest.doctor.firstName} ${selectedRequest.doctor.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
                      <Typography variant="body1">
                        {selectedRequest.orderDate
                          ? new Date(selectedRequest.orderDate).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                      <Chip
                        label={selectedRequest.priority}
                        color={getPriorityColor(selectedRequest.priority)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedRequest.status}
                        color={getStatusColor(selectedRequest.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 1 }}>Tests</Typography>
                      {selectedRequest.tests && selectedRequest.tests.length > 0 ? (
                        selectedRequest.tests.map((testItem, index) => {
                          const test = typeof testItem.test === 'object' ? testItem.test : null;
                          return (
                            <Card key={index} sx={{ mb: 1 }}>
                              <CardContent>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  {test ? test.name : 'Unknown Test'}
                                </Typography>
                                {test && (
                                  <>
                                    <Typography variant="body2" color="text.secondary">
                                      Category: {test.category}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Cost: NPR {test.cost}
                                    </Typography>
                                  </>
                                )}
                                {testItem.notes && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Notes: {testItem.notes}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })
                      ) : (
                        <Typography variant="body2" color="text.secondary">No tests</Typography>
                      )}
                    </Grid>
                    {selectedRequest.instructions && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Instructions</Typography>
                        <Typography variant="body1">{selectedRequest.instructions}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRequestViewDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* View Result Dialog */}
          <Dialog open={openResultViewDialog} onClose={() => setOpenResultViewDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Lab Result Details</DialogTitle>
            <DialogContent>
              {selectedResult && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
                      <Typography variant="body1">
                        {typeof selectedResult.patient === 'object'
                          ? `${selectedResult.patient.firstName} ${selectedResult.patient.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Test</Typography>
                      <Typography variant="body1">
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
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedResult.status}
                        color={getStatusColor(selectedResult.status)}
                        size="small"
                      />
                    </Grid>
                    {selectedResult.resultValues && selectedResult.resultValues.length > 0 && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="h6" sx={{ mb: 1 }}>Result Values</Typography>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Parameter</TableCell>
                                  <TableCell>Value</TableCell>
                                  <TableCell>Unit</TableCell>
                                  <TableCell>Normal Range</TableCell>
                                  <TableCell>Flag</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedResult.resultValues.map((value, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{value.parameterName}</TableCell>
                                    <TableCell>{value.value}</TableCell>
                                    <TableCell>{value.unit || '-'}</TableCell>
                                    <TableCell>{value.normalRange || '-'}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={value.flag}
                                        color={
                                          value.flag === 'Normal' ? 'success' :
                                          value.flag === 'Critical' ? 'error' : 'warning'
                                        }
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Grid>
                      </>
                    )}
                    {selectedResult.comments && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Comments</Typography>
                        <Typography variant="body1">{selectedResult.comments}</Typography>
                      </Grid>
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
