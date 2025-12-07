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
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('tests.test', 'name cost')
      .populate('medicalRecord')
      .populate('invoice', 'invoiceNumber status')
      .sort({ orderDate: -1 });
    res.status(200).json({ success: true, count: labRequests.length, data: { labRequests } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lab requests', error: error.message });
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
    if (req.user.role === 'Patient') query.patient = req.user.id;
    else if (req.user.role === 'Doctor') query.doctor = req.user.id;
    else if (patient) query.patient = patient;
    else if (doctor) query.doctor = doctor;
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
