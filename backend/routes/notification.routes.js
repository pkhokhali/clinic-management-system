const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getNotifications);

router
  .route('/read-all')
  .put(markAllAsRead);

router
  .route('/:id/read')
  .put(markAsRead);

router
  .route('/:id')
  .delete(deleteNotification);

module.exports = router;

