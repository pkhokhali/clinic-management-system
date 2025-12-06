const express = require('express');
const {
  createInvoice,
  getInvoices,
  getInvoice,
  addPayment,
} = require('../controllers/invoice.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getInvoices)
  .post(authorize('Super Admin', 'Admin', 'Receptionist'), createInvoice);

router
  .route('/:id')
  .get(getInvoice);

router
  .route('/:id/payment')
  .post(addPayment);

module.exports = router;
