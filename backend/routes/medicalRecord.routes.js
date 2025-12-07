const express = require('express');
const {
  createMedicalRecord,
  getMedicalRecords,
  getMedicalRecord,
  updateMedicalRecord,
  createPrescription,
  getPrescriptions,
  createCompleteRecord,
} = require('../controllers/medicalRecord.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/records')
  .get(getMedicalRecords)
  .post(authorize('Doctor', 'Super Admin', 'Admin'), createMedicalRecord);

router
  .route('/records/:id')
  .get(getMedicalRecord)
  .put(updateMedicalRecord);

router
  .route('/records/complete')
  .post(authorize('Doctor', 'Super Admin', 'Admin'), createCompleteRecord);

router
  .route('/prescriptions')
  .get(getPrescriptions)
  .post(authorize('Doctor', 'Super Admin', 'Admin'), createPrescription);

module.exports = router;
