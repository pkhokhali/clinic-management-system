const LabTest = require('../models/LabTest.model');
const LabRequest = require('../models/LabRequest.model');
const LabResult = require('../models/LabResult.model');

// Lab Test CRUD
exports.createLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.create(req.body);
    res.status(201).json({ success: true, data: { labTest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating lab test', error: error.message });
  }
};

exports.getLabTests = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const labTests = await LabTest.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: labTests.length, data: { labTests } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lab tests', error: error.message });
  }
};

exports.getLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id);
    if (!labTest) {
      return res.status(404).json({ success: false, message: 'Lab test not found' });
    }
    res.status(200).json({ success: true, data: { labTest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lab test', error: error.message });
  }
};

exports.updateLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!labTest) {
      return res.status(404).json({ success: false, message: 'Lab test not found' });
    }
    res.status(200).json({ success: true, data: { labTest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating lab test', error: error.message });
  }
};

// Lab Request
exports.createLabRequest = async (req, res) => {
  try {
    const labRequest = await LabRequest.create({
      ...req.body,
      requestedBy: req.user.id,
    });
    const populated = await LabRequest.findById(labRequest._id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name cost');
    res.status(201).json({ success: true, data: { labRequest: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating lab request', error: error.message });
  }
};

exports.getLabRequests = async (req, res) => {
  try {
    const { status, patient, doctor, isBilled } = req.query;
    const query = {};
    
    // Role-based visibility:
    // - Patient: own requests only
    // - Doctor: own requests only
    // - Lab Technician: only billed requests (isBilled = true)
    // - Admin, Super Admin, Receptionist: all requests (can filter by isBilled)
    if (req.user.role === 'Patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'Doctor') {
      query.doctor = req.user.id;
    } else if (req.user.role === 'Lab Technician') {
      // Lab Technician can only see billed requests
      query.isBilled = true;
    }
    // Admin, Super Admin, Receptionist can see all
    
    if (patient) query.patient = patient;
    if (doctor) query.doctor = doctor;
    if (status) query.status = status;
    // Allow filtering by billing status for Admin/Super Admin/Receptionist
    if (isBilled !== undefined && (req.user.role === 'Super Admin' || req.user.role === 'Admin' || req.user.role === 'Receptionist')) {
      query.isBilled = isBilled === 'true';
    }

    const labRequests = await LabRequest.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('tests.test', 'name cost category description')
      .populate('medicalRecord')
      .populate('invoice', 'invoiceNumber status')
      .sort({ orderDate: -1 });
    res.status(200).json({ success: true, count: labRequests.length, data: { labRequests } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lab requests', error: error.message });
  }
};

exports.getLabRequest = async (req, res) => {
  try {
    const labRequest = await LabRequest.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('tests.test', 'name cost category description')
      .populate('medicalRecord')
      .populate('invoice', 'invoiceNumber status');

    if (!labRequest) {
      return res.status(404).json({ success: false, message: 'Lab request not found' });
    }

    // Check authorization - Patient/Doctor can only see their own requests
    if (req.user.role === 'Patient' && labRequest.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this lab request' });
    }
    if (req.user.role === 'Doctor' && labRequest.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this lab request' });
    }

    res.status(200).json({ success: true, data: { labRequest } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lab request', error: error.message });
  }
};

// Lab Result
exports.createLabResult = async (req, res) => {
  try {
    const labResult = await LabResult.create({
      ...req.body,
      technician: req.user.id,
    });
    const populated = await LabResult.findById(labResult._id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('test', 'name');
    res.status(201).json({ success: true, data: { labResult: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating lab result', error: error.message });
  }
};

exports.getLabResults = async (req, res) => {
  try {
    const { patient, doctor, status } = req.query;
    const query = {};
    
    if (req.user.role === 'Patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'Doctor') {
      // For doctors, only show lab results for their assigned patients
      // Find all patients the doctor has appointments with or has created medical records for
      const Appointment = require('../models/Appointment.model');
      const MedicalRecord = require('../models/MedicalRecord.model');
      
      // Get all appointments for this doctor
      const appointments = await Appointment.find({ doctor: req.user.id }).distinct('patient');
      
      // Get all medical records created by this doctor
      const medicalRecords = await MedicalRecord.find({ doctor: req.user.id }).distinct('patient');
      
      // Combine unique patient IDs
      const assignedPatientIds = [...new Set([...appointments, ...medicalRecords])];
      
      if (assignedPatientIds.length === 0) {
        // If doctor has no assigned patients, return empty results
        return res.status(200).json({ success: true, count: 0, data: { labResults: [] } });
      }
      
      // Filter lab results to only show those for assigned patients
      query.patient = { $in: assignedPatientIds };
      query.doctor = req.user.id; // Also ensure the doctor field matches
    } else if (patient) {
      query.patient = patient;
    } else if (doctor) {
      query.doctor = doctor;
    }
    
    if (status) query.status = status;

    const labResults = await LabResult.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('test', 'name')
      .sort({ resultDate: -1 });
    res.status(200).json({ success: true, count: labResults.length, data: { labResults } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lab results', error: error.message });
  }
};
