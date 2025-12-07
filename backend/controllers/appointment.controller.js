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

    // Validate date is not in the past
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date cannot be in the past',
      });
    }

    // Validate time if appointment is today
    if (selectedDate.getTime() === today.getTime()) {
      const [hour, minute] = appointmentTime.split(':').map(Number);
      const appointmentDateTime = new Date();
      appointmentDateTime.setHours(hour, minute, 0, 0);

      if (appointmentDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Appointment time must be in the future',
        });
      }
    }

    // Check if doctor has schedule for this date/time
    const DoctorSchedule = require('../models/DoctorSchedule.model');
    const dayOfWeek = selectedDate.getDay();
    const dateString = selectedDate.toISOString().split('T')[0];

    const schedules = await DoctorSchedule.find({
      doctor,
      isActive: true,
      $or: [
        {
          isRecurring: true,
          dayOfWeek: dayOfWeek,
          effectiveFrom: { $lte: selectedDate },
          $or: [
            { effectiveUntil: { $exists: false } },
            { effectiveUntil: null },
            { effectiveUntil: { $gte: selectedDate } },
          ],
        },
        {
          isRecurring: false,
          specificDate: {
            $gte: new Date(dateString + 'T00:00:00.000Z'),
            $lt: new Date(dateString + 'T23:59:59.999Z'),
          },
        },
      ],
    });

    if (schedules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Doctor does not have a schedule for this date',
      });
    }

    // Check if the selected time is within any schedule's time range
    const [selectedHour, selectedMin] = appointmentTime.split(':').map(Number);
    const selectedTimeMinutes = selectedHour * 60 + selectedMin;

    const isTimeValid = schedules.some((schedule) => {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      const startTimeMinutes = startHour * 60 + startMin;
      const endTimeMinutes = endHour * 60 + endMin;

      return selectedTimeMinutes >= startTimeMinutes && selectedTimeMinutes < endTimeMinutes;
    });

    if (!isTimeValid) {
      return res.status(400).json({
        success: false,
        message: 'Selected time is not within doctor\'s schedule',
      });
    }

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

// Helper function to auto-update appointments to "No Show" if date has passed
async function updateExpiredAppointments() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    // Find appointments that are past their date/time and still Scheduled or Confirmed
    const expiredAppointments = await Appointment.find({
      status: { $in: ['Scheduled', 'Confirmed'] },
    });
    
    // Update each expired appointment
    for (const appointment of expiredAppointments) {
      const appointmentDate = new Date(appointment.appointmentDate);
      const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
      appointmentDateOnly.setHours(0, 0, 0, 0);
      
      // Check if appointment date has passed
      if (appointmentDateOnly < today) {
        // Appointment date is in the past
        appointment.status = 'No Show';
        await appointment.save();
      } else if (appointmentDateOnly.getTime() === today.getTime()) {
        // Appointment is today - check if time has passed
        const [hour, minute] = appointment.appointmentTime.split(':').map(Number);
        const appointmentDateTime = new Date(appointmentDate);
        appointmentDateTime.setHours(hour, minute, 0, 0);
        
        if (appointmentDateTime < now) {
          appointment.status = 'No Show';
          await appointment.save();
        }
      }
    }
  } catch (error) {
    console.error('Error updating expired appointments:', error);
    // Don't throw error - this is a background operation
  }
}

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    // Auto-update expired appointments to "No Show"
    await updateExpiredAppointments();
    
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
    // Auto-update expired appointments to "No Show"
    await updateExpiredAppointments();
    
    let appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone dateOfBirth gender bloodGroup')
      .populate('doctor', 'firstName lastName specialization licenseNumber')
      .populate('createdBy', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }
    
    // Check if this specific appointment needs status update
    if (appointment.status === 'Scheduled' || appointment.status === 'Confirmed') {
      const now = new Date();
      const appointmentDate = new Date(appointment.appointmentDate);
      const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
      appointmentDateOnly.setHours(0, 0, 0, 0);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDateOnly < today) {
        appointment.status = 'No Show';
        await appointment.save();
      } else if (appointmentDateOnly.getTime() === today.getTime()) {
        const [hour, minute] = appointment.appointmentTime.split(':').map(Number);
        const appointmentDateTime = new Date(appointmentDate);
        appointmentDateTime.setHours(hour, minute, 0, 0);
        if (appointmentDateTime < now) {
          appointment.status = 'No Show';
          await appointment.save();
        }
      }
      
      // Re-fetch to get updated status
      appointment = await Appointment.findById(req.params.id)
        .populate('patient', 'firstName lastName email phone dateOfBirth gender bloodGroup')
        .populate('doctor', 'firstName lastName specialization licenseNumber')
        .populate('createdBy', 'firstName lastName');
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

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required',
      });
    }

    // Use the schedule-based availability endpoint logic
    const scheduleController = require('./doctorSchedule.controller');
    req.params.doctorId = doctorId;
    req.query.date = date;
    
    return scheduleController.getAvailableSlots(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor availability',
      error: error.message,
    });
  }
};
