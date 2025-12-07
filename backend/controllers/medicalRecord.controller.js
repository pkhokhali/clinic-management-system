const MedicalRecord = require('../models/MedicalRecord.model');
const Prescription = require('../models/Prescription.model');
const LabRequest = require('../models/LabRequest.model');
const Appointment = require('../models/Appointment.model');

exports.createMedicalRecord = async (req, res) => {
  try {
    const { appointment } = req.body;
    
    const medicalRecord = await MedicalRecord.create({
      ...req.body,
      doctor: req.user.id,
    });
    
    // Update appointment status to "Completed" if appointment is linked
    if (appointment) {
      await Appointment.findByIdAndUpdate(appointment, {
        status: 'Completed',
      });
    }
    
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
    // - Doctor: when viewing a specific patient's history, show all records for that patient (not just own)
    // - Doctor: when viewing general list, show only own records
    // - Admin, Super Admin, Receptionist: all records
    if (req.user.role === 'Patient') {
      query.patient = req.user.id;
    } else if (patient) {
      query.patient = patient;
      // If doctor is viewing a specific patient's history, show all records for that patient
      // (not filtered by doctor, so they can see the complete patient history)
      // The patient must be assigned to this doctor (handled by patients list filtering)
    } else if (req.user.role === 'Doctor') {
      // When viewing general list (no specific patient), show only own records
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

// @desc    Get follow-up appointments (medical records with follow-up dates)
// @route   GET /api/medical/records/follow-ups
// @access  Private (Super Admin, Admin, Receptionist)
exports.getFollowUpAppointments = async (req, res) => {
  try {
    const { startDate, endDate, past } = req.query;
    const query = {
      'followUp.date': { $exists: true, $ne: null },
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query['followUp.date'] = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query['followUp.date'].$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query['followUp.date'].$lte = end;
      }
    } else if (past === 'true') {
      // Get past follow-ups
      query['followUp.date'] = { $lt: today };
    } else {
      // Default: get upcoming and today's follow-ups
      query['followUp.date'] = { $gte: today };
    }

    const medicalRecords = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment')
      .sort({ 'followUp.date': 1 }); // Sort by follow-up date ascending
    
    res.status(200).json({ 
      success: true, 
      count: medicalRecords.length, 
      data: { followUpAppointments: medicalRecords } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching follow-up appointments', 
      error: error.message 
    });
  }
};

// @desc    Get single medical record
// @route   GET /api/medical/records/:id
// @access  Private
exports.getMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment')
      .populate('labRequest')
      .populate('prescription');

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Check access permissions
    if (
      req.user.role !== 'Super Admin' &&
      req.user.role !== 'Admin' &&
      req.user.role !== 'Receptionist' &&
      medicalRecord.patient._id.toString() !== req.user.id.toString() &&
      (req.user.role !== 'Doctor' || medicalRecord.doctor._id.toString() !== req.user.id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this medical record',
      });
    }

    res.status(200).json({
      success: true,
      data: { medicalRecord },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medical record',
      error: error.message,
    });
  }
};

// @desc    Update medical record
// @route   PUT /api/medical/records/:id
// @access  Private (Doctor can edit their own, Admin/Super Admin can edit all)
exports.updateMedicalRecord = async (req, res) => {
  try {
    let medicalRecord = await MedicalRecord.findById(req.params.id);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      });
    }

    // Check permissions - Doctor can only edit their own records
    if (
      req.user.role !== 'Super Admin' &&
      req.user.role !== 'Admin' &&
      (req.user.role !== 'Doctor' || medicalRecord.doctor.toString() !== req.user.id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this medical record',
      });
    }

    // Update medical record
    medicalRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment')
      .populate('labRequest')
      .populate('prescription');

    res.status(200).json({
      success: true,
      data: { medicalRecord },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating medical record',
      error: error.message,
    });
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
      // If doctor is viewing a specific patient's history, show all prescriptions for that patient
      // (not filtered by doctor, so they can see the complete patient history)
    } else if (req.user.role === 'Doctor') {
      // When viewing general list (no specific patient), show only own prescriptions
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
    
    // Update appointment status to "Completed" if appointment is linked
    if (appointment) {
      await Appointment.findByIdAndUpdate(appointment, {
        status: 'Completed',
      });
    }

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
