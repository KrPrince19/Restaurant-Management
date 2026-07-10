const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true, // e.g., '18:00', '19:00', '20:00'
  },
  guests: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    default: 1, // in hours
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', ReservationSchema);
