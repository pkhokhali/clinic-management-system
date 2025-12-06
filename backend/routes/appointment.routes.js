const express = require('express');
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getDoctorAvailability,
} = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAppointments)
  .post(createAppointment);

router.get('/availability/:doctorId', getDoctorAvailability);

router
  .route('/:id')
  .get(getAppointment)
  .put(updateAppointment);

router.put('/:id/cancel', cancelAppointment);

module.exports = router;
