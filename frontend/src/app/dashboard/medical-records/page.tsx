'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  FormGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  LocalPharmacy as PrescriptionIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
  LocalPharmacy as LocalPharmacyIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/api';
import { User } from '@/types';

interface MedicalRecord {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  appointment?: string | any;
  date: string | Date;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  diagnosis?: string[];
  treatment?: string;
  followUp?: {
    date?: Date | string;
    notes?: string;
  };
}

interface Prescription {
  _id?: string;
  id?: string;
  patient: string | User;
  doctor: string | User;
  appointment?: string | any;
  medicalRecord?: string | any;
  medications: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity: number;
  }>;
  date: string | Date;
  notes?: string;
  status: 'Active' | 'Completed' | 'Cancelled';
}

interface Medication {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

export default function MedicalRecordsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const searchParams = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  
  // Medical Records state
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  
  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Data for forms
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [loadingLabTests, setLoadingLabTests] = useState(false);
  
  // Dialog states - Records
  const [openRecordDialog, setOpenRecordDialog] = useState(false);
  const [openRecordViewDialog, setOpenRecordViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [recordFormData, setRecordFormData] = useState({
    patient: '',
    doctor: currentUser?.role === 'Doctor' ? (currentUser.id || '') : '',
    appointment: '',
    date: new Date().toISOString().split('T')[0],
    chiefComplaint: '',
    historyOfPresentIllness: '',
    physicalExamination: '',
    diagnosis: [] as string[],
    treatment: '',
    followUpDate: '',
    followUpNotes: '',
    // New fields for combined workflow
    selectedLabTests: [] as string[],
    labPriority: 'Routine' as 'Routine' | 'Urgent' | 'Stat',
    labInstructions: '',
    prescriptionMedications: [] as Medication[],
    prescriptionNotes: '',
  });
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [submittingRecord, setSubmittingRecord] = useState(false);
  
  // Dialog states - Prescriptions
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [openPrescriptionViewDialog, setOpenPrescriptionViewDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [prescriptionFormData, setPrescriptionFormData] = useState({
    patient: '',
    doctor: currentUser?.role === 'Doctor' ? (currentUser.id || '') : '',
    appointment: '',
    medicalRecord: '',
    medications: [] as Medication[],
    notes: '',
    status: 'Active' as 'Active' | 'Completed' | 'Cancelled',
  });
  const [currentMedication, setCurrentMedication] = useState<Medication>({
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: 1,
  });
  const [currentRecordMedication, setCurrentRecordMedication] = useState<Medication>({
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: 1,
  });
  const [submittingPrescription, setSubmittingPrescription] = useState(false);

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
  const fetchAppointments = async (patientId?: string) => {
    try {
      const params = new URLSearchParams();
      if (patientId) params.append('patient', patientId);
      const response = await api.get(`/appointments?${params.toString()}`);
      const appointmentsList = (response.data.data.appointments || []).map((apt: any) => ({
        ...apt,
        id: apt._id || apt.id,
      }));
      setAppointments(appointmentsList);
    } catch (err: any) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  // Fetch lab tests
  const fetchLabTests = async () => {
    try {
      setLoadingLabTests(true);
      const response = await api.get('/lab/tests');
      const testsList = (response.data.data.labTests || []).map((test: any) => ({
        ...test,
        id: test._id || test.id,
      }));
      setLabTests(testsList.filter((t: any) => t.isActive !== false));
    } catch (err: any) {
      console.error('Failed to fetch lab tests:', err);
    } finally {
      setLoadingLabTests(false);
    }
  };

  // Fetch medical records
  const fetchRecords = async () => {
    try {
      setLoadingRecords(true);
      setError(null);
      const params = new URLSearchParams();
      if (patientFilter !== 'all') {
        params.append('patient', patientFilter);
      }
      
      const response = await api.get(`/medical/records?${params.toString()}`);
      const recordsList = (response.data.data.medicalRecords || []).map((record: any) => ({
        ...record,
        id: record._id || record.id,
      }));
      setRecords(recordsList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch medical records');
    } finally {
      setLoadingRecords(false);
    }
  };

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      setLoadingPrescriptions(true);
      setError(null);
      const params = new URLSearchParams();
      if (patientFilter !== 'all') {
        params.append('patient', patientFilter);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await api.get(`/medical/prescriptions?${params.toString()}`);
      const prescriptionsList = (response.data.data.prescriptions || []).map((pres: any) => ({
        ...pres,
        id: pres._id || pres.id,
      }));
      setPrescriptions(prescriptionsList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch prescriptions');
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // Fetch lab tests and initial data
  useEffect(() => {
    fetchLabTests();
    if (currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Doctor') {
      fetchPatients();
    }
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle appointment parameter from URL
  useEffect(() => {
    const appointmentId = searchParams?.get('appointment');
    if (appointmentId) {
      // Fetch appointment data directly
      const fetchAppointmentForRecord = async () => {
        try {
          const response = await api.get(`/appointments/${appointmentId}`);
          const appointment = response.data.data.appointment;
          if (appointment) {
            const patientId = typeof appointment.patient === 'object' ? appointment.patient.id || appointment.patient._id : appointment.patient;
            const doctorId = typeof appointment.doctor === 'object' ? appointment.doctor.id || appointment.doctor._id : appointment.doctor;
            
            setRecordFormData(prev => ({
              ...prev,
              appointment: appointmentId,
              patient: patientId || '',
              doctor: doctorId || prev.doctor,
              date: appointment.appointmentDate 
                ? (typeof appointment.appointmentDate === 'string'
                    ? appointment.appointmentDate.split('T')[0]
                    : new Date(appointment.appointmentDate).toISOString().split('T')[0])
                : new Date().toISOString().split('T')[0],
            }));
            setOpenRecordDialog(true);
            // Remove appointment parameter from URL
            window.history.replaceState({}, '', '/dashboard/medical-records');
          }
        } catch (err: any) {
          console.error('Failed to fetch appointment:', err);
          setError('Failed to load appointment data');
        }
      };
      
      fetchAppointmentForRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientFilter, tabValue]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchPrescriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientFilter, statusFilter, tabValue]);

  // Handle patient selection change - fetch appointments
  useEffect(() => {
    if (recordFormData.patient) {
      fetchAppointments(recordFormData.patient);
    } else {
      setAppointments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordFormData.patient]);

  // Filter records
  const filteredRecords = records.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    const patient = typeof record.patient === 'object' ? record.patient : null;
    const doctor = typeof record.doctor === 'object' ? record.doctor : null;
    
    return (
      (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
      (doctor && `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchLower)) ||
      record.chiefComplaint?.toLowerCase().includes(searchLower) ||
      record.diagnosis?.some(d => d.toLowerCase().includes(searchLower))
    );
  });

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter((pres) => {
    const searchLower = searchTerm.toLowerCase();
    const patient = typeof pres.patient === 'object' ? pres.patient : null;
    const doctor = typeof pres.doctor === 'object' ? pres.doctor : null;
    
    return (
      (patient && `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower)) ||
      (doctor && `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchLower)) ||
      pres.medications?.some(m => m.medicineName.toLowerCase().includes(searchLower))
    );
  });

  // Handle record submission (with support for combined workflow and editing)
  const handleRecordSubmit = async () => {
    try {
      setSubmittingRecord(true);
      setError(null);
      
      // Check if we're editing
      const isEditing = editingRecord !== null;
      
      const hasLabTests = recordFormData.selectedLabTests.length > 0;
      const hasPrescription = recordFormData.prescriptionMedications.length > 0;
      
      // For editing, use PUT endpoint
      if (isEditing) {
        const payload: any = {
          patient: recordFormData.patient,
          doctor: recordFormData.doctor,
          date: recordFormData.date,
          chiefComplaint: recordFormData.chiefComplaint,
          historyOfPresentIllness: recordFormData.historyOfPresentIllness,
          physicalExamination: recordFormData.physicalExamination,
          diagnosis: recordFormData.diagnosis,
          treatment: recordFormData.treatment,
        };
        
        if (recordFormData.appointment) payload.appointment = recordFormData.appointment;
        if (recordFormData.followUpDate) {
          payload.followUp = {
            date: recordFormData.followUpDate,
            notes: recordFormData.followUpNotes,
          };
        }
        
        const recordId = editingRecord.id || editingRecord._id;
        await api.put(`/medical/records/${recordId}`, payload);
        setSuccess('Medical record updated successfully!');
      } else {
        // Use combined endpoint if lab tests or prescription are present
        if (hasLabTests || hasPrescription) {
          const payload: any = {
            patient: recordFormData.patient,
            doctor: recordFormData.doctor,
            date: recordFormData.date,
            chiefComplaint: recordFormData.chiefComplaint,
            historyOfPresentIllness: recordFormData.historyOfPresentIllness,
            physicalExamination: recordFormData.physicalExamination,
            diagnosis: recordFormData.diagnosis,
            treatment: recordFormData.treatment,
          };
          
          if (recordFormData.appointment) payload.appointment = recordFormData.appointment;
          if (recordFormData.followUpDate) {
            payload.followUp = {
              date: recordFormData.followUpDate,
              notes: recordFormData.followUpNotes,
            };
          }
          
          // Add lab tests if selected
          if (hasLabTests) {
            payload.labTests = recordFormData.selectedLabTests;
            payload.labPriority = recordFormData.labPriority;
            if (recordFormData.labInstructions) {
              payload.labInstructions = recordFormData.labInstructions;
            }
          }
          
          // Add prescription if medications provided
          if (hasPrescription) {
            payload.medications = recordFormData.prescriptionMedications;
            if (recordFormData.prescriptionNotes) {
              payload.prescriptionNotes = recordFormData.prescriptionNotes;
            }
          }
          
          await api.post('/medical/records/complete', payload);
          setSuccess('Medical record with lab tests and prescription created successfully!');
        } else {
          // Use regular endpoint if no lab tests or prescription
          const payload: any = {
            patient: recordFormData.patient,
            doctor: recordFormData.doctor,
            date: recordFormData.date,
            chiefComplaint: recordFormData.chiefComplaint,
            historyOfPresentIllness: recordFormData.historyOfPresentIllness,
            physicalExamination: recordFormData.physicalExamination,
            diagnosis: recordFormData.diagnosis,
            treatment: recordFormData.treatment,
          };
          
          if (recordFormData.appointment) payload.appointment = recordFormData.appointment;
          if (recordFormData.followUpDate) {
            payload.followUp = {
              date: recordFormData.followUpDate,
              notes: recordFormData.followUpNotes,
            };
          }
          
          await api.post('/medical/records', payload);
          setSuccess('Medical record created successfully!');
        }
      }
      
      setOpenRecordDialog(false);
      setEditingRecord(null);
      resetRecordForm();
      fetchRecords();
      if (hasLabTests) {
        // Refresh prescriptions tab if lab tests were added (they might create prescriptions)
        setTimeout(() => {
          if (tabValue === 1) {
            fetchPrescriptions();
          }
        }, 500);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create medical record');
    } finally {
      setSubmittingRecord(false);
    }
  };

  // Handle prescription submission
  const handlePrescriptionSubmit = async () => {
    try {
      setSubmittingPrescription(true);
      setError(null);
      
      if (prescriptionFormData.medications.length === 0) {
        setError('Please add at least one medication');
        setSubmittingPrescription(false);
        return;
      }
      
      const payload: any = {
        patient: prescriptionFormData.patient,
        doctor: prescriptionFormData.doctor,
        medications: prescriptionFormData.medications,
        notes: prescriptionFormData.notes,
        status: prescriptionFormData.status,
      };
      
      if (prescriptionFormData.appointment) payload.appointment = prescriptionFormData.appointment;
      if (prescriptionFormData.medicalRecord) payload.medicalRecord = prescriptionFormData.medicalRecord;
      
      await api.post('/medical/prescriptions', payload);
      setSuccess('Prescription created successfully!');
      setOpenPrescriptionDialog(false);
      resetPrescriptionForm();
      fetchPrescriptions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmittingPrescription(false);
    }
  };

  // Add diagnosis
  const handleAddDiagnosis = () => {
    if (diagnosisInput.trim()) {
      setRecordFormData({
        ...recordFormData,
        diagnosis: [...recordFormData.diagnosis, diagnosisInput.trim()],
      });
      setDiagnosisInput('');
    }
  };

  // Remove diagnosis
  const handleRemoveDiagnosis = (index: number) => {
    setRecordFormData({
      ...recordFormData,
      diagnosis: recordFormData.diagnosis.filter((_, i) => i !== index),
    });
  };

  // Add medication
  const handleAddMedication = () => {
    if (currentMedication.medicineName && currentMedication.dosage && currentMedication.frequency && currentMedication.duration) {
      setPrescriptionFormData({
        ...prescriptionFormData,
        medications: [...prescriptionFormData.medications, { ...currentMedication }],
      });
      setCurrentMedication({
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1,
      });
    }
  };

  // Remove medication
  const handleRemoveMedication = (index: number) => {
    setPrescriptionFormData({
      ...prescriptionFormData,
      medications: prescriptionFormData.medications.filter((_, i) => i !== index),
    });
  };

  // Add medication to record form (for combined workflow)
  const handleAddMedicationToRecord = () => {
    if (currentRecordMedication.medicineName && currentRecordMedication.dosage && currentRecordMedication.frequency && currentRecordMedication.duration) {
      setRecordFormData({
        ...recordFormData,
        prescriptionMedications: [...recordFormData.prescriptionMedications, { ...currentRecordMedication }],
      });
      setCurrentRecordMedication({
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1,
      });
    }
  };

  // Remove medication from record form
  const handleRemoveMedicationFromRecord = (index: number) => {
    setRecordFormData({
      ...recordFormData,
      prescriptionMedications: recordFormData.prescriptionMedications.filter((_, i) => i !== index),
    });
  };

  // Reset forms
  const resetRecordForm = () => {
    setEditingRecord(null);
    setRecordFormData({
      patient: '',
      doctor: currentUser?.role === 'Doctor' ? (currentUser.id || '') : '',
      appointment: '',
      date: new Date().toISOString().split('T')[0],
      chiefComplaint: '',
      historyOfPresentIllness: '',
      physicalExamination: '',
      diagnosis: [],
      treatment: '',
      followUpDate: '',
      followUpNotes: '',
      selectedLabTests: [],
      labPriority: 'Routine',
      labInstructions: '',
      prescriptionMedications: [],
      prescriptionNotes: '',
    });
    setDiagnosisInput('');
    setCurrentRecordMedication({
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1,
    });
  };

  const resetPrescriptionForm = () => {
    setPrescriptionFormData({
      patient: '',
      doctor: currentUser?.role === 'Doctor' ? (currentUser.id || '') : '',
      appointment: '',
      medicalRecord: '',
      medications: [],
      notes: '',
      status: 'Active',
    });
    setCurrentMedication({
      medicineName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1,
    });
  };

  // View record
  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setOpenRecordViewDialog(true);
  };

  // Edit record
  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    const patientObj = typeof record.patient === 'object' ? (record.patient as any) : null;
    const doctorObj = typeof record.doctor === 'object' ? (record.doctor as any) : null;
    const appointmentObj = typeof record.appointment === 'object' && record.appointment ? (record.appointment as any) : null;
    
    const patientId = patientObj ? (patientObj.id || patientObj._id) : record.patient;
    const doctorId = doctorObj ? (doctorObj.id || doctorObj._id) : record.doctor;
    const appointmentId = appointmentObj ? (appointmentObj.id || appointmentObj._id) : record.appointment;
    
    setRecordFormData({
      patient: patientId || '',
      doctor: doctorId || '',
      appointment: appointmentId || '',
      date: record.date
        ? (typeof record.date === 'string' ? record.date.split('T')[0] : new Date(record.date).toISOString().split('T')[0])
        : new Date().toISOString().split('T')[0],
      chiefComplaint: record.chiefComplaint || '',
      historyOfPresentIllness: record.historyOfPresentIllness || '',
      physicalExamination: record.physicalExamination || '',
      diagnosis: record.diagnosis || [],
      treatment: record.treatment || '',
      followUpDate: record.followUp?.date
        ? (() => {
            const followUpDate: string | Date = record.followUp!.date as string | Date;
            return typeof followUpDate === 'string' 
              ? followUpDate.split('T')[0] 
              : new Date(followUpDate).toISOString().split('T')[0];
          })()
        : '',
      followUpNotes: record.followUp?.notes || '',
      selectedLabTests: [],
      labPriority: 'Routine' as 'Routine' | 'Urgent' | 'Stat',
      labInstructions: '',
      prescriptionMedications: [],
      prescriptionNotes: '',
    });
    setOpenRecordDialog(true);
  };

  // View prescription
  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setOpenPrescriptionViewDialog(true);
  };

  const canCreate = currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin' || currentUser?.role === 'Doctor';

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'Admin', 'Doctor']}>
      <DashboardLayout>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Medical Records
            </Typography>
            {canCreate && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {tabValue === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      resetRecordForm();
                      setOpenRecordDialog(true);
                    }}
                  >
                    Add Medical Record
                  </Button>
                )}
                {tabValue === 1 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      resetPrescriptionForm();
                      setOpenPrescriptionDialog(true);
                    }}
                  >
                    Add Prescription
                  </Button>
                )}
              </Box>
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
              <Tab icon={<AssignmentIcon />} iconPosition="start" label="Medical Records" />
              <Tab icon={<PrescriptionIcon />} iconPosition="start" label="Prescriptions" />
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
              {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
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
              {tabValue === 1 && (
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Filter by Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </Paper>

          {/* Medical Records Tab */}
          {tabValue === 0 && (
            <TableContainer component={Paper}>
              {loadingRecords ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredRecords.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No medical records found</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Chief Complaint</TableCell>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const patient = typeof record.patient === 'object' ? record.patient : null;
                      const doctor = typeof record.doctor === 'object' ? record.doctor : null;
                      const recordDate = record.date
                        ? (typeof record.date === 'string' ? new Date(record.date) : record.date)
                        : null;

                      return (
                        <TableRow key={record.id || record._id} hover>
                          <TableCell>
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {recordDate ? recordDate.toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>{record.chiefComplaint || '-'}</TableCell>
                          <TableCell>
                            {record.diagnosis && record.diagnosis.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {record.diagnosis.slice(0, 2).map((diag, idx) => (
                                  <Chip key={idx} label={diag} size="small" />
                                ))}
                                {record.diagnosis.length > 2 && (
                                  <Chip label={`+${record.diagnosis.length - 2}`} size="small" />
                                )}
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewRecord(record)}
                                  color="primary"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              {(currentUser?.role === 'Doctor' || currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                                <Tooltip title="Edit Record">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditRecord(record)}
                                    color="primary"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          )}

          {/* Prescriptions Tab */}
          {tabValue === 1 && (
            <TableContainer component={Paper}>
              {loadingPrescriptions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredPrescriptions.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No prescriptions found</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Medications</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPrescriptions.map((prescription) => {
                      const patient = typeof prescription.patient === 'object' ? prescription.patient : null;
                      const doctor = typeof prescription.doctor === 'object' ? prescription.doctor : null;
                      const prescriptionDate = prescription.date
                        ? (typeof prescription.date === 'string' ? new Date(prescription.date) : prescription.date)
                        : null;

                      return (
                        <TableRow key={prescription.id || prescription._id} hover>
                          <TableCell>
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {prescriptionDate ? prescriptionDate.toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {prescription.medications?.length || 0} medication(s)
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={prescription.status}
                              color={
                                prescription.status === 'Active' ? 'success' :
                                prescription.status === 'Completed' ? 'default' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewPrescription(prescription)}
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

          {/* Add Medical Record Dialog */}
          {canCreate && (
            <Dialog open={openRecordDialog} onClose={() => { setOpenRecordDialog(false); setEditingRecord(null); resetRecordForm(); }} maxWidth="md" fullWidth scroll="paper">
              <DialogTitle>{editingRecord ? 'Edit Medical Record' : 'Add Medical Record'}</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                    <FormControl fullWidth required>
                      <InputLabel>Patient</InputLabel>
                      <Select
                        value={recordFormData.patient}
                        label="Patient"
                        onChange={(e) => setRecordFormData({ ...recordFormData, patient: e.target.value, appointment: '' })}
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
                      value={recordFormData.doctor}
                      label="Doctor"
                      onChange={(e) => setRecordFormData({ ...recordFormData, doctor: e.target.value })}
                      disabled={currentUser?.role === 'Doctor'}
                    >
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Appointment (Optional)</InputLabel>
                    <Select
                      value={recordFormData.appointment}
                      label="Appointment (Optional)"
                      onChange={(e) => setRecordFormData({ ...recordFormData, appointment: e.target.value })}
                      disabled={!recordFormData.patient}
                    >
                      <MenuItem value="">None</MenuItem>
                      {appointments.map((apt) => (
                        <MenuItem key={apt.id} value={apt.id}>
                          {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Date"
                    type="date"
                    value={recordFormData.date}
                    onChange={(e) => setRecordFormData({ ...recordFormData, date: e.target.value })}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Chief Complaint"
                    value={recordFormData.chiefComplaint}
                    onChange={(e) => setRecordFormData({ ...recordFormData, chiefComplaint: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <TextField
                    label="History of Present Illness"
                    value={recordFormData.historyOfPresentIllness}
                    onChange={(e) => setRecordFormData({ ...recordFormData, historyOfPresentIllness: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                  />
                  <TextField
                    label="Physical Examination"
                    value={recordFormData.physicalExamination}
                    onChange={(e) => setRecordFormData({ ...recordFormData, physicalExamination: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                  />
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Diagnosis"
                        value={diagnosisInput}
                        onChange={(e) => setDiagnosisInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDiagnosis();
                          }
                        }}
                        fullWidth
                        size="small"
                      />
                      <Button onClick={handleAddDiagnosis} variant="outlined">Add</Button>
                    </Box>
                    {recordFormData.diagnosis.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {recordFormData.diagnosis.map((diag, index) => (
                          <Chip
                            key={index}
                            label={diag}
                            onDelete={() => handleRemoveDiagnosis(index)}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <TextField
                    label="Treatment"
                    value={recordFormData.treatment}
                    onChange={(e) => setRecordFormData({ ...recordFormData, treatment: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                  />
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Lab Tests Section */}
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScienceIcon /> Lab Tests to be Done (Optional)
                    </Typography>
                    {loadingLabTests ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        <FormGroup>
                          {labTests.map((test) => (
                            <FormControlLabel
                              key={test.id || test._id}
                              control={
                                <Checkbox
                                  checked={recordFormData.selectedLabTests.includes(test.id || test._id || '')}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setRecordFormData({
                                        ...recordFormData,
                                        selectedLabTests: [...recordFormData.selectedLabTests, test.id || test._id || ''],
                                      });
                                    } else {
                                      setRecordFormData({
                                        ...recordFormData,
                                        selectedLabTests: recordFormData.selectedLabTests.filter(id => id !== (test.id || test._id)),
                                      });
                                    }
                                  }}
                                />
                              }
                              label={`${test.name} (${test.category}) - Rs. ${test.cost}`}
                            />
                          ))}
                        </FormGroup>
                        {recordFormData.selectedLabTests.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Priority</InputLabel>
                              <Select
                                value={recordFormData.labPriority}
                                label="Priority"
                                onChange={(e) => setRecordFormData({ ...recordFormData, labPriority: e.target.value as any })}
                              >
                                <MenuItem value="Routine">Routine</MenuItem>
                                <MenuItem value="Urgent">Urgent</MenuItem>
                                <MenuItem value="Stat">Stat</MenuItem>
                              </Select>
                            </FormControl>
                            <TextField
                              label="Lab Instructions (Optional)"
                              value={recordFormData.labInstructions}
                              onChange={(e) => setRecordFormData({ ...recordFormData, labInstructions: e.target.value })}
                              fullWidth
                              multiline
                              rows={2}
                              sx={{ mt: 2 }}
                            />
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Prescription Section */}
                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalPharmacyIcon /> Prescription (Optional)
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Medicine Name"
                          value={currentRecordMedication.medicineName}
                          onChange={(e) => setCurrentRecordMedication({ ...currentRecordMedication, medicineName: e.target.value })}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Dosage"
                          value={currentRecordMedication.dosage}
                          onChange={(e) => setCurrentRecordMedication({ ...currentRecordMedication, dosage: e.target.value })}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Frequency"
                          value={currentRecordMedication.frequency}
                          onChange={(e) => setCurrentRecordMedication({ ...currentRecordMedication, frequency: e.target.value })}
                          fullWidth
                          size="small"
                          placeholder="e.g., 2x daily"
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Duration"
                          value={currentRecordMedication.duration}
                          onChange={(e) => setCurrentRecordMedication({ ...currentRecordMedication, duration: e.target.value })}
                          fullWidth
                          size="small"
                          placeholder="e.g., 7 days"
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Quantity"
                          type="number"
                          value={currentRecordMedication.quantity}
                          onChange={(e) => setCurrentRecordMedication({ ...currentRecordMedication, quantity: parseInt(e.target.value) || 1 })}
                          fullWidth
                          size="small"
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Instructions"
                          value={currentRecordMedication.instructions}
                          onChange={(e) => setCurrentRecordMedication({ ...currentRecordMedication, instructions: e.target.value })}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          onClick={handleAddMedicationToRecord}
                          variant="outlined"
                          startIcon={<AddIcon />}
                          disabled={!currentRecordMedication.medicineName || !currentRecordMedication.dosage || !currentRecordMedication.frequency || !currentRecordMedication.duration}
                        >
                          Add Medication
                        </Button>
                      </Grid>
                    </Grid>
                    {recordFormData.prescriptionMedications.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Added Medications:</Typography>
                        {recordFormData.prescriptionMedications.map((med, index) => (
                          <Chip
                            key={index}
                            label={`${med.medicineName} - ${med.dosage}, ${med.frequency}, ${med.duration}`}
                            onDelete={() => handleRemoveMedicationFromRecord(index)}
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}
                    <TextField
                      label="Prescription Notes (Optional)"
                      value={recordFormData.prescriptionNotes}
                      onChange={(e) => setRecordFormData({ ...recordFormData, prescriptionNotes: e.target.value })}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <TextField
                    label="Follow-up Date (Optional)"
                    type="date"
                    value={recordFormData.followUpDate}
                    onChange={(e) => setRecordFormData({ ...recordFormData, followUpDate: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Follow-up Notes (Optional)"
                    value={recordFormData.followUpNotes}
                    onChange={(e) => setRecordFormData({ ...recordFormData, followUpNotes: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenRecordDialog(false); setEditingRecord(null); resetRecordForm(); }} disabled={submittingRecord}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRecordSubmit}
                  variant="contained"
                  disabled={submittingRecord || !recordFormData.patient || !recordFormData.doctor}
                >
                  {submittingRecord ? <CircularProgress size={24} /> : 'Create Record'}
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Add Prescription Dialog */}
          {canCreate && (
            <Dialog open={openPrescriptionDialog} onClose={() => { setOpenPrescriptionDialog(false); resetPrescriptionForm(); }} maxWidth="md" fullWidth scroll="paper">
              <DialogTitle>Add Prescription</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                  {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                    <FormControl fullWidth required>
                      <InputLabel>Patient</InputLabel>
                      <Select
                        value={prescriptionFormData.patient}
                        label="Patient"
                        onChange={(e) => setPrescriptionFormData({ ...prescriptionFormData, patient: e.target.value, appointment: '', medicalRecord: '' })}
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
                      value={prescriptionFormData.doctor}
                      label="Doctor"
                      onChange={(e) => setPrescriptionFormData({ ...prescriptionFormData, doctor: e.target.value })}
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
                      value={prescriptionFormData.appointment}
                      label="Appointment (Optional)"
                      onChange={(e) => setPrescriptionFormData({ ...prescriptionFormData, appointment: e.target.value })}
                      disabled={!prescriptionFormData.patient}
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
                  <Typography variant="h6">Add Medications</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Medicine Name"
                        value={currentMedication.medicineName}
                        onChange={(e) => setCurrentMedication({ ...currentMedication, medicineName: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Dosage"
                        value={currentMedication.dosage}
                        onChange={(e) => setCurrentMedication({ ...currentMedication, dosage: e.target.value })}
                        fullWidth
                        size="small"
                        placeholder="e.g., 500mg"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Frequency"
                        value={currentMedication.frequency}
                        onChange={(e) => setCurrentMedication({ ...currentMedication, frequency: e.target.value })}
                        fullWidth
                        size="small"
                        placeholder="e.g., 3 times daily"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Duration"
                        value={currentMedication.duration}
                        onChange={(e) => setCurrentMedication({ ...currentMedication, duration: e.target.value })}
                        fullWidth
                        size="small"
                        placeholder="e.g., 7 days"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={currentMedication.quantity}
                        onChange={(e) => setCurrentMedication({ ...currentMedication, quantity: parseInt(e.target.value) || 1 })}
                        fullWidth
                        size="small"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Instructions (Optional)"
                        value={currentMedication.instructions}
                        onChange={(e) => setCurrentMedication({ ...currentMedication, instructions: e.target.value })}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        onClick={handleAddMedication}
                        disabled={!currentMedication.medicineName || !currentMedication.dosage || !currentMedication.frequency || !currentMedication.duration}
                      >
                        Add Medication
                      </Button>
                    </Grid>
                  </Grid>
                  {prescriptionFormData.medications.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Medications Added:</Typography>
                      {prescriptionFormData.medications.map((med, index) => (
                        <Card key={index} sx={{ mb: 1 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  {med.medicineName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {med.dosage} - {med.frequency} - {med.duration} (Qty: {med.quantity})
                                </Typography>
                                {med.instructions && (
                                  <Typography variant="body2" color="text.secondary">
                                    Instructions: {med.instructions}
                                  </Typography>
                                )}
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveMedication(index)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                  <TextField
                    label="Notes (Optional)"
                    value={prescriptionFormData.notes}
                    onChange={(e) => setPrescriptionFormData({ ...prescriptionFormData, notes: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenPrescriptionDialog(false); resetPrescriptionForm(); }} disabled={submittingPrescription}>
                  Cancel
                </Button>
                <Button
                  onClick={handlePrescriptionSubmit}
                  variant="contained"
                  disabled={submittingPrescription || !prescriptionFormData.patient || !prescriptionFormData.doctor || prescriptionFormData.medications.length === 0}
                >
                  {submittingPrescription ? <CircularProgress size={24} /> : 'Create Prescription'}
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* View Record Dialog */}
          <Dialog open={openRecordViewDialog} onClose={() => setOpenRecordViewDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogContent>
              {selectedRecord && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
                      <Typography variant="body1">
                        {typeof selectedRecord.patient === 'object' 
                          ? `${selectedRecord.patient.firstName} ${selectedRecord.patient.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Doctor</Typography>
                      <Typography variant="body1">
                        {typeof selectedRecord.doctor === 'object'
                          ? `Dr. ${selectedRecord.doctor.firstName} ${selectedRecord.doctor.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                      <Typography variant="body1">
                        {selectedRecord.date
                          ? new Date(selectedRecord.date).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    {selectedRecord.chiefComplaint && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Chief Complaint</Typography>
                        <Typography variant="body1">{selectedRecord.chiefComplaint}</Typography>
                      </Grid>
                    )}
                    {selectedRecord.historyOfPresentIllness && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">History of Present Illness</Typography>
                        <Typography variant="body1">{selectedRecord.historyOfPresentIllness}</Typography>
                      </Grid>
                    )}
                    {selectedRecord.physicalExamination && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Physical Examination</Typography>
                        <Typography variant="body1">{selectedRecord.physicalExamination}</Typography>
                      </Grid>
                    )}
                    {selectedRecord.diagnosis && selectedRecord.diagnosis.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Diagnosis</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {selectedRecord.diagnosis.map((diag, idx) => (
                            <Chip key={idx} label={diag} />
                          ))}
                        </Box>
                      </Grid>
                    )}
                    {selectedRecord.treatment && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Treatment</Typography>
                        <Typography variant="body1">{selectedRecord.treatment}</Typography>
                      </Grid>
                    )}
                    {selectedRecord.followUp && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Follow-up</Typography>
                        <Typography variant="body1">
                          Date: {selectedRecord.followUp.date ? new Date(selectedRecord.followUp.date).toLocaleDateString() : 'N/A'}
                        </Typography>
                        {selectedRecord.followUp.notes && (
                          <Typography variant="body1">Notes: {selectedRecord.followUp.notes}</Typography>
                        )}
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRecordViewDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* View Prescription Dialog */}
          <Dialog open={openPrescriptionViewDialog} onClose={() => setOpenPrescriptionViewDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogContent>
              {selectedPrescription && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
                      <Typography variant="body1">
                        {typeof selectedPrescription.patient === 'object'
                          ? `${selectedPrescription.patient.firstName} ${selectedPrescription.patient.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Doctor</Typography>
                      <Typography variant="body1">
                        {typeof selectedPrescription.doctor === 'object'
                          ? `Dr. ${selectedPrescription.doctor.firstName} ${selectedPrescription.doctor.lastName}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                      <Typography variant="body1">
                        {selectedPrescription.date
                          ? new Date(selectedPrescription.date).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedPrescription.status}
                        color={
                          selectedPrescription.status === 'Active' ? 'success' :
                          selectedPrescription.status === 'Completed' ? 'default' : 'error'
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Medications</Typography>
                      {selectedPrescription.medications && selectedPrescription.medications.length > 0 ? (
                        selectedPrescription.medications.map((med, index) => (
                          <Card key={index} sx={{ mb: 1 }}>
                            <CardContent>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {med.medicineName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Dosage: {med.dosage}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Frequency: {med.frequency}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Duration: {med.duration}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Quantity: {med.quantity}
                              </Typography>
                              {med.instructions && (
                                <Typography variant="body2" color="text.secondary">
                                  Instructions: {med.instructions}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">No medications</Typography>
                      )}
                    </Grid>
                    {selectedPrescription.notes && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                        <Typography variant="body1">{selectedPrescription.notes}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenPrescriptionViewDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
