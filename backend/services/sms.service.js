const twilio = require('twilio');

// Lazy initialization - only create client when credentials are available
let client = null;

const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  
  return client;
};

// Send SMS
exports.sendSMS = async (to, message) => {
  try {
    const twilioClient = getTwilioClient();
    
    if (!twilioClient) {
      console.warn('Twilio credentials not configured. SMS not sent.');
      return null;
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Send appointment reminder SMS
exports.sendAppointmentReminder = async (phone, appointment) => {
  const message = `Reminder: You have an appointment on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime} with Dr. ${appointment.doctor?.lastName}.`;
  return await exports.sendSMS(phone, message);
};

// Send lab result notification SMS
exports.sendLabResultNotification = async (phone, labResult) => {
  const message = `Your lab test results for ${labResult.test?.name} are now available. Please check your account.`;
  return await exports.sendSMS(phone, message);
};