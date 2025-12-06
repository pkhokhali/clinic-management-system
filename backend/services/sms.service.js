// SMS Service - Completely Disabled
// All SMS functions are stubs that return null without errors

// Send SMS
exports.sendSMS = async (to, message) => {
  // SMS service disabled
  return null;
};

// Send appointment reminder SMS
exports.sendAppointmentReminder = async (phone, appointment) => {
  // SMS service disabled
  return null;
};

// Send lab result notification SMS
exports.sendLabResultNotification = async (phone, labResult) => {
  // SMS service disabled
  return null;
};