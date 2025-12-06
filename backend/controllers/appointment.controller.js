const Appointment = require('../models/Appointment.model');
const User = require('../models/User.model');
const { sendEmail } = require('../services/email.service');
const { sendAppointmentReminder } = require('../services/sms.service');

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Patient, Receptionist, Doctor, Admin)
exports.createAppointment = async (req, res) => {
  try {
    const { patient, doctor, appointmentDate, appointmentTime, reason, notes } = req.body;

    // Check for conflicts
    const conflictingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['Scheduled', 'Confirmed'] },
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already has an appointment at this time',
      });
    }

    const appointment = await Appointment.create({
      patient: patient || req.user.id,
      doctor,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      createdBy: req.user.id,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');

    // Send confirmation email
    try {
      if (populatedAppointment.patient.email) {
        await sendEmail({
          email: populatedAppointment.patient.email,
          subject: 'Appointment Scheduled',
          html: `<p>Your appointment with Dr. ${populatedAppointment.doctor.lastName} has been scheduled for ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}.</p>`,
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      data: { appointment: populatedAppointment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message,
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const { status, patient, doctor, startDate, endDate } = req.query;
    const query = {};

    if (req.user.role === 'Patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'Doctor') {
      query.doctor = req.user.id;
    } else if (patient) {
      query.patient = patient;
    } else if (doctor) {
      query.doctor = doctor;
    }

    if (status) query.status = status;
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: { appointments },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message,
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender bloodGroup')
      .populate('doctor', 'firstName lastName specialization licenseNumber')
      .populate('createdBy', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check access permissions
    if (
      req.user.role !== 'Super Admin' &&
      req.user.role !== 'Admin' &&
      req.user.role !== 'Receptionist' &&
      appointment.patient._id.toString() !== req.user.id.toString() &&
      appointment.doctor._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment',
      });
    }

    res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message,
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check permissions
    if (
      req.user.role !== 'Super Admin' &&
      req.user.role !== 'Admin' &&
      req.user.role !== 'Receptionist' &&
      appointment.patient.toString() !== req.user.id.toString() &&
      appointment.doctor.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization');

    res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message,
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment.status = 'Cancelled';
    appointment.cancelledAt = Date.now();
    appointment.cancellationReason = cancellationReason;

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment: populatedAppointment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message,
    });
  }
};

// @desc    Get doctor availability
// @route   GET /api/appointments/availability/:doctorId
// @access  Private
exports.getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const selectedDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Scheduled', 'Confirmed'] },
    }).select('appointmentTime');

    const bookedSlots = appointments.map((apt) => apt.appointmentTime);

    // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
    const availableSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        if (!bookedSlots.includes(time)) {
          availableSlots.push(time);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        date: selectedDate,
        availableSlots,
        bookedSlots,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor availability',
      error: error.message,
    });
  }
};
