const nodemailer = require('nodemailer');

// Lazy initialization - only create transporter when credentials are available
let transporter = null;

const getTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  return transporter;
};

// Send email
exports.sendEmail = async (options) => {
  try {
    const emailTransporter = getTransporter();
    
    if (!emailTransporter) {
      console.warn('Email credentials not configured. Email not sent.');
      return null;
    }

    const message = {
      from: `${process.env.EMAIL_FROM_NAME || 'Clinic Management'} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message,
    };

    const info = await emailTransporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const message = `
    <h2>Password Reset Request</h2>
    <p>Hello ${user.firstName},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return await exports.sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    html: message,
  });
};

// Send appointment confirmation email
exports.sendAppointmentConfirmation = async (user, appointment) => {
  const message = `
    <h2>Appointment Confirmed</h2>
    <p>Hello ${user.firstName},</p>
    <p>Your appointment has been confirmed:</p>
    <ul>
      <li><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</li>
      <li><strong>Time:</strong> ${appointment.appointmentTime}</li>
      <li><strong>Doctor:</strong> ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}</li>
      <li><strong>Status:</strong> ${appointment.status}</li>
    </ul>
    <p>Thank you for choosing our clinic.</p>
  `;

  return await exports.sendEmail({
    email: user.email,
    subject: 'Appointment Confirmed',
    html: message,
  });
};

// Send lab result notification email
exports.sendLabResultNotification = async (user, labResult) => {
  const message = `
    <h2>Lab Results Available</h2>
    <p>Hello ${user.firstName},</p>
    <p>Your lab test results are now available.</p>
    <ul>
      <li><strong>Test:</strong> ${labResult.test?.name}</li>
      <li><strong>Order Date:</strong> ${new Date(labResult.orderDate).toLocaleDateString()}</li>
      <li><strong>Status:</strong> ${labResult.status}</li>
    </ul>
    <p>Please log in to your account to view the results.</p>
  `;

  return await exports.sendEmail({
    email: user.email,
    subject: 'Lab Results Available',
    html: message,
  });
};