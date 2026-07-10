import React, { useState, useEffect } from 'react';
import api from '../api';
import { format12H } from '../utils';

const EditModal = ({ reservation, tables, onClose, onSaved }) => {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [guests, setGuests] = useState(2);
  const [duration, setDuration] = useState(1);
  const [tableId, setTableId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = ['18:00', '19:00', '20:00', '21:00', '22:00'];

  useEffect(() => {
    if (reservation) {
      setDate(new Date(reservation.date).toISOString().split('T')[0]);
      setTimeSlot(reservation.timeSlot);
      setGuests(reservation.guests);
      setDuration(reservation.duration || 1);
      setTableId(reservation.table?._id || reservation.table);
    }
  }, [reservation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.put(`/reservations/${reservation._id}`, {
        date, timeSlot, guests: Number(guests), duration: Number(duration), tableId
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update reservation');
    } finally {
      setLoading(false);
    }
  };

  if (!reservation) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, 
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="card" style={{ width: '400px', backgroundColor: 'var(--surface)', position: 'relative' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
        >
          &times;
        </button>
        <h3 className="mb-4">Edit Reservation</h3>
        
        {error && <div className="text-danger mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" required value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <select className="form-select" required value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
              <option value="">Select Time</option>
              {timeSlots.map(t => <option key={t} value={t}>{format12H(t)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duration (Hours)</label>
            <input type="number" min="1" max="12" className="form-input" required value={duration} onChange={e => setDuration(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Guests</label>
            <input type="number" min="1" max="10" className="form-input" required value={guests} onChange={e => setGuests(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Table (Override)</label>
            <select className="form-select" required value={tableId} onChange={e => setTableId(e.target.value)}>
              <option value="">Select Table</option>
              {tables.filter(t => t.capacity >= guests).map(t => (
                <option key={t._id} value={t._id}>Table {t.tableNumber} ({t.capacity} seats)</option>
              ))}
            </select>
            {tables.filter(t => t.capacity >= guests).length === 0 && (
              <span className="text-danger text-sm mt-1">No tables large enough for {guests} guests.</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
