const express = require('express');
const {
  createLabTest,
  getLabTests,
  getLabTest,
  updateLabTest,
  createLabRequest,
  getLabRequests,
  createLabResult,
  getLabResults,
} = require('../controllers/lab.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

// Lab Tests routes
router
  .route('/tests')
  .get(getLabTests)
  .post(authorize('Super Admin', 'Admin', 'Lab Technician'), createLabTest);

router
  .route('/tests/:id')
  .get(getLabTest)
  .put(authorize('Super Admin', 'Admin', 'Lab Technician'), updateLabTest);

// Lab Requests routes
router
  .route('/requests')
  .get(getLabRequests)
  .post(authorize('Doctor', 'Receptionist', 'Super Admin', 'Admin'), createLabRequest);

// Lab Results routes
router
  .route('/results')
  .get(getLabResults)
  .post(authorize('Lab Technician', 'Super Admin', 'Admin'), createLabResult);

module.exports = router;
