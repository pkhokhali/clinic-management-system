const express = require('express');
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getUsers) // Authorization handled in controller based on role
  .post(authorize('Super Admin', 'Admin'), createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('Super Admin', 'Admin'), deleteUser);

module.exports = router;
