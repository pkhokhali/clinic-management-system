const MedicalRecord = require('../models/MedicalRecord.model');
const Prescription = require('../models/Prescription.model');

exports.createMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.create({
      ...req.body,
      doctor: req.user.id,
    });
    const populated = await MedicalRecord.findById(medicalRecord._id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization');
    res.status(201).json({ success: true, data: { medicalRecord: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating medical record', error: error.message });
  }
};

exports.getMedicalRecords = async (req, res) => {
  try {
    const { patient } = req.query;
    const query = {};
    
    if (req.user.role === 'Patient') {
      query.patient = req.user.id;
    } else if (patient) {
      query.patient = patient;
    }
    
    if (req.user.role === 'Doctor') {
      query.doctor = req.user.id;
    }

    const medicalRecords = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ date: -1 });
    
    res.status(200).json({ success: true, count: medicalRecords.length, data: { medicalRecords } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching medical records', error: error.message });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.create({
      ...req.body,
      doctor: req.user.id,
    });
    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName');
    res.status(201).json({ success: true, data: { prescription: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating prescription', error: error.message });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const { patient, status } = req.query;
    const query = {};
    
    if (req.user.role === 'Patient') {
      query.patient = req.user.id;
    } else if (patient) {
      query.patient = patient;
    }
    
    if (req.user.role === 'Doctor') {
      query.doctor = req.user.id;
    }
    
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .sort({ date: -1 });
    
    res.status(200).json({ success: true, count: prescriptions.length, data: { prescriptions } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching prescriptions', error: error.message });
  }
};
