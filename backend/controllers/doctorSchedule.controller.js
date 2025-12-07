const DoctorSchedule = require('../models/DoctorSchedule.model');

// @desc    Create doctor schedule
// @route   POST /api/schedules
// @access  Private (Super Admin, Admin)
exports.createSchedule = async (req, res) => {
  try {
    const schedule = await DoctorSchedule.create({
      ...req.body,
      createdBy: req.user.id,
    });

    const populated = await DoctorSchedule.findById(schedule._id)
      .populate('doctor', 'firstName lastName specialization');

    res.status(201).json({
      success: true,
      data: { schedule: populated },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating doctor schedule',
      error: error.message,
    });
  }
};

// @desc    Get all doctor schedules
// @route   GET /api/schedules
// @access  Private
exports.getSchedules = async (req, res) => {
  try {
    const { doctor, isActive } = req.query;
    const query = {};

    if (doctor) {
      query.doctor = doctor;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const schedules = await DoctorSchedule.find(query)
      .populate('doctor', 'firstName lastName specialization')
      .populate('createdBy', 'firstName lastName')
      .sort({ doctor: 1, dayOfWeek: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: { schedules },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor schedules',
      error: error.message,
    });
  }
};

// @desc    Get single doctor schedule
// @route   GET /api/schedules/:id
// @access  Private
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await DoctorSchedule.findById(req.params.id)
      .populate('doctor', 'firstName lastName specialization')
      .populate('createdBy', 'firstName lastName');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Doctor schedule not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { schedule },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor schedule',
      error: error.message,
    });
  }
};

// @desc    Update doctor schedule
// @route   PUT /api/schedules/:id
// @access  Private (Super Admin, Admin)
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await DoctorSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('doctor', 'firstName lastName specialization');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Doctor schedule not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { schedule },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating doctor schedule',
      error: error.message,
    });
  }
};

// @desc    Delete doctor schedule
// @route   DELETE /api/schedules/:id
// @access  Private (Super Admin, Admin)
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await DoctorSchedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Doctor schedule not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor schedule deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor schedule',
      error: error.message,
    });
  }
};

// @desc    Get available time slots for a doctor on a specific date
// @route   GET /api/schedules/availability/:doctorId
// @access  Private
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required',
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const dateString = selectedDate.toISOString().split('T')[0];

    // Find all active schedules for this doctor
    const schedules = await DoctorSchedule.find({
      doctor: doctorId,
      isActive: true,
      $or: [
        // Recurring schedule for this day of week
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
        // One-time schedule for this specific date
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
      return res.status(200).json({
        success: true,
        data: {
          date: selectedDate,
          availableSlots: [],
          bookedSlots: [],
          message: 'No schedule found for this doctor on this date',
        },
      });
    }

    // Get all booked appointments for this doctor on this date
    const Appointment = require('../models/Appointment.model');
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Scheduled', 'Confirmed'] },
    }).select('appointmentTime');

    const bookedSlots = appointments.map((apt) => apt.appointmentTime);

    // Generate available time slots based on all schedules
    const allSlots = new Set();

    schedules.forEach((schedule) => {
      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      const slotDuration = schedule.slotDuration || 30;

      let currentHour = startHour;
      let currentMin = startMin;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin)
      ) {
        const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        
        // Only add slots that are not booked
        if (!bookedSlots.includes(timeSlot)) {
          allSlots.add(timeSlot);
        }

        // Move to next slot
        currentMin += slotDuration;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }
    });

    // Convert to sorted array
    const availableSlots = Array.from(allSlots).sort();

    // Filter out past times if the selected date is today
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const filteredSlots = isToday
      ? availableSlots.filter((slot) => {
          const [hour, minute] = slot.split(':').map(Number);
          const slotTime = new Date(now);
          slotTime.setHours(hour, minute, 0, 0);
          return slotTime > now;
        })
      : availableSlots;

    res.status(200).json({
      success: true,
      data: {
        date: selectedDate,
        availableSlots: filteredSlots,
        bookedSlots,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message,
    });
  }
};

