const MedicalRecord = require('../models/MedicalRecord.model');
const Prescription = require('../models/Prescription.model');
const LabRequest = require('../models/LabRequest.model');

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
    
    // Role-based visibility:
    // - Patient: own records only
    // - Doctor: own records only
    // - Admin, Super Admin, Receptionist: all records
    if (req.user.role === 'Patient') {
      query.patient = req.user.id;
    } else if (patient) {
      query.patient = patient;
    }
    
    if (req.user.role === 'Doctor') {
      query.doctor = req.user.id;
    }
    // Admin, Super Admin, Receptionist can see all (no filter)

    const medicalRecords = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .populate('labRequest')
      .populate('prescription')
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

// @desc    Create medical record with lab request and prescription (combined)
// @route   POST /api/medical/records/complete
// @access  Private (Doctor, Super Admin, Admin)
exports.createCompleteRecord = async (req, res) => {
  try {
    const {
      // Medical Record fields
      patient,
      appointment,
      date,
      chiefComplaint,
      historyOfPresentIllness,
      physicalExamination,
      diagnosis,
      treatment,
      followUp,
      // Lab Request fields (optional)
      labTests,
      labPriority,
      labInstructions,
      // Prescription fields (optional)
      medications,
      prescriptionNotes,
    } = req.body;

    // Create medical record
    const medicalRecordData = {
      patient,
      doctor: req.user.id,
      appointment,
      date: date || new Date(),
      chiefComplaint,
      historyOfPresentIllness,
      physicalExamination,
      diagnosis: diagnosis || [],
      treatment,
      followUp,
    };

    const medicalRecord = await MedicalRecord.create(medicalRecordData);
    let labRequest = null;
    let prescription = null;

    // Create lab request if lab tests are provided
    if (labTests && labTests.length > 0) {
      labRequest = await LabRequest.create({
        patient,
        doctor: req.user.id,
        appointment,
        medicalRecord: medicalRecord._id,
        tests: labTests.map((testId) => ({
          test: testId,
        })),
        priority: labPriority || 'Routine',
        instructions: labInstructions,
        requestedBy: req.user.id,
        status: 'Pending',
      });

      // Link lab request to medical record
      medicalRecord.labRequest = labRequest._id;
      await medicalRecord.save();
    }

    // Create prescription if medications are provided
    if (medications && medications.length > 0) {
      prescription = await Prescription.create({
        patient,
        doctor: req.user.id,
        appointment,
        medicalRecord: medicalRecord._id,
        medications,
        notes: prescriptionNotes,
        status: 'Active',
      });

      // Link prescription to medical record
      medicalRecord.prescription = prescription._id;
      await medicalRecord.save();
    }

    // Populate and return complete record
    const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment')
      .populate({
        path: 'labRequest',
        populate: {
          path: 'tests.test',
          select: 'name cost',
        },
      })
      .populate('prescription');

    res.status(201).json({
      success: true,
      data: {
        medicalRecord: populatedRecord,
        labRequest: labRequest ? await LabRequest.findById(labRequest._id)
          .populate('tests.test', 'name cost') : null,
        prescription: prescription ? await Prescription.findById(prescription._id) : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating complete medical record',
      error: error.message,
    });
  }
};
