const express = require('express');
const {
  getDashboardStats,
  getRevenueReport,
} = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Super Admin', 'Admin'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueReport);

module.exports = router;
