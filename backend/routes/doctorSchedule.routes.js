const express = require('express');
const {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  getAvailableSlots,
} = require('../controllers/doctorSchedule.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

// Routes for managing schedules (Super Admin, Admin only)
router
  .route('/')
  .get(getSchedules)
  .post(authorize('Super Admin', 'Admin'), createSchedule);

router
  .route('/:id')
  .get(getSchedule)
  .put(authorize('Super Admin', 'Admin'), updateSchedule)
  .delete(authorize('Super Admin', 'Admin'), deleteSchedule);

// Route for getting available slots (any authenticated user)
router.get('/availability/:doctorId', getAvailableSlots);

module.exports = router;

