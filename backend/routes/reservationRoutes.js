const express = require('express');
const router = express.Router();
const {
  getAvailability,
  createReservation,
  updateReservation,
  getMyReservations,
  cancelReservation,
  getAllReservations,
  createTable,
  getTables
} = require('../controllers/reservationController');
const { protect, admin } = require('../middleware/auth');

// Customer and Admin routes
router.route('/availability').get(protect, getAvailability);
router.route('/').post(protect, createReservation).get(protect, getMyReservations);
router.route('/:id').put(protect, updateReservation).delete(protect, cancelReservation);

// Admin only routes
router.route('/admin/all').get(protect, admin, getAllReservations);
router.route('/admin/tables').post(protect, admin, createTable).get(protect, admin, getTables);

module.exports = router;
