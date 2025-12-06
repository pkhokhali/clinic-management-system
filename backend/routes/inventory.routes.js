const express = require('express');
const {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  createSupplier,
  getSuppliers,
} = require('../controllers/inventory.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/items')
  .get(getInventoryItems)
  .post(authorize('Super Admin', 'Admin'), createInventoryItem);

router
  .route('/items/:id')
  .put(authorize('Super Admin', 'Admin'), updateInventoryItem);

router
  .route('/suppliers')
  .get(getSuppliers)
  .post(authorize('Super Admin', 'Admin'), createSupplier);

module.exports = router;
