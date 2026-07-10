const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// Customer: Get availability for a specific date
const getAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const tables = await Table.find({}).sort('tableNumber');
    const reservations = await Reservation.find({ date: queryDate });

    res.json({ tables, reservations });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Customer: Create a reservation
const createReservation = async (req, res) => {
  try {
    const { date, timeSlot, guests, duration = 1, tableId } = req.body;
    
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    // timeSlot is '18:00', duration is 1 or 2
    const startHour = parseInt(timeSlot.split(':')[0], 10);
    const requestedSlots = [];
    for (let i = 0; i < duration; i++) {
      requestedSlots.push(`${startHour + i}:00`);
    }

    // Check table capacity
    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (table.capacity < guests) return res.status(400).json({ message: 'Table capacity too small' });

    // Check overlapping for all requested slots
    const existingReservations = await Reservation.find({
      date: reservationDate,
      table: tableId
    });

    for (let resv of existingReservations) {
      const resvStart = parseInt(resv.timeSlot.split(':')[0], 10);
      const resvDur = resv.duration || 1;
      const resvSlots = [];
      for (let i = 0; i < resvDur; i++) {
        resvSlots.push(`${resvStart + i}:00`);
      }
      
      const overlap = requestedSlots.some(slot => resvSlots.includes(slot));
      if (overlap) {
        return res.status(409).json({ message: 'Table is already booked during this time' });
      }
    }

    // Create reservation
    const reservation = await Reservation.create({
      date: reservationDate,
      timeSlot,
      guests,
      duration,
      table: table._id,
      user: req.user.id,
    });

    await reservation.populate('table');

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Customer: Get own reservations
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id }).populate('table').sort({ date: 1, timeSlot: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Customer/Admin: Cancel reservation
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    await reservation.deleteOne();
    res.json({ message: 'Reservation cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Customer/Admin: Update reservation
const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot, guests, duration = 1, tableId } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this reservation' });
    }

    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    const startHour = parseInt(timeSlot.split(':')[0], 10);
    const requestedSlots = [];
    for (let i = 0; i < duration; i++) {
      requestedSlots.push(`${startHour + i}:00`);
    }

    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    if (table.capacity < guests) return res.status(400).json({ message: 'Table capacity too small' });

    // Check overlapping, EXCLUDING current reservation
    const existingReservations = await Reservation.find({
      date: reservationDate,
      table: tableId,
      _id: { $ne: id }
    });

    for (let resv of existingReservations) {
      const resvStart = parseInt(resv.timeSlot.split(':')[0], 10);
      const resvDur = resv.duration || 1;
      const resvSlots = [];
      for (let i = 0; i < resvDur; i++) {
        resvSlots.push(`${resvStart + i}:00`);
      }
      
      const overlap = requestedSlots.some(slot => resvSlots.includes(slot));
      if (overlap) {
        return res.status(409).json({ message: 'Table is already booked during this time' });
      }
    }

    reservation.date = reservationDate;
    reservation.timeSlot = timeSlot;
    reservation.guests = guests;
    reservation.duration = duration;
    reservation.table = tableId;

    await reservation.save();
    await reservation.populate('table');

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Admin: Get all reservations (with optional date filter)
const getAllReservations = async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    }

    const reservations = await Reservation.find(query).populate('table').populate('user', 'email role').sort({ date: 1, timeSlot: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Admin: Create tables
const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const tableExists = await Table.findOne({ tableNumber });
    
    if (tableExists) {
      return res.status(400).json({ message: 'Table already exists' });
    }

    const table = await Table.create({ tableNumber, capacity });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Admin: Get all tables
const getTables = async (req, res) => {
  try {
    const tables = await Table.find({}).sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAvailability,
  createReservation,
  updateReservation,
  getMyReservations,
  cancelReservation,
  getAllReservations,
  createTable,
  getTables
};
