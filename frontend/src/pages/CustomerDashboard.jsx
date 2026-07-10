import React, { useState, useEffect } from 'react';
import api from '../api';
import { CalendarDays, Users, Clock, Trash2, Utensils, Edit } from 'lucide-react';
import { format12H } from '../utils';
import EditModal from '../components/EditModal';

const CustomerDashboard = () => {
  const [reservations, setReservations] = useState([]);
  
  // Booking State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [guests, setGuests] = useState(2);
  const [duration, setDuration] = useState(1);
  const [availability, setAvailability] = useState(null); // { tables: [], reservations: [] }
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  
  const [loadingBook, setLoadingBook] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = ['18:00', '19:00', '20:00', '21:00', '22:00'];

  const fetchReservations = async () => {
    try {
      const { data } = await api.get('/reservations');
      setReservations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailability = async (isBackground = false) => {
    if (!isBackground) setLoadingAvailability(true);
    try {
      const { data } = await api.get(`/reservations/availability?date=${date}`);
      setAvailability(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isBackground) setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    fetchReservations();
    fetchAvailability();

    const intervalId = setInterval(() => {
      fetchReservations();
      fetchAvailability(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [date]);

  const cancelReservation = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.delete(`/reservations/${id}`);
        fetchReservations();
        fetchAvailability();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const isSlotBooked = (tableId, time) => {
    if (!availability) return false;
    const startHour = parseInt(time.split(':')[0], 10);
    
    return availability.reservations.some(res => {
      if (res.table !== tableId) return false;
      const resStart = parseInt(res.timeSlot.split(':')[0], 10);
      const resDur = res.duration || 1;
      
      // Check if `time` falls within [resStart, resStart + resDur - 1]
      return startHour >= resStart && startHour < resStart + resDur;
    });
  };

  const handleBook = async (tableId, time) => {
    setLoadingBook(true);
    setError('');
    
    // Quick frontend check for multiple hours
    for (let i = 1; i < duration; i++) {
      const nextHour = `${parseInt(time.split(':')[0], 10) + i}:00`;
      if (!timeSlots.includes(nextHour) || isSlotBooked(tableId, nextHour)) {
        setError(`Cannot book for ${duration} hours because ${format12H(nextHour)} is not available.`);
        setLoadingBook(false);
        return;
      }
    }

    try {
      await api.post('/reservations', { 
        date, 
        timeSlot: time, 
        guests: Number(guests),
        duration: Number(duration),
        tableId
      });
      fetchReservations();
      fetchAvailability();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoadingBook(false);
    }
  };

  // Filter tables by capacity
  const suitableTables = availability?.tables.filter(t => t.capacity >= guests) || [];

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      
      {/* Booking Section */}
      <div className="card">
        <h3>Book a Table</h3>
        <p className="text-muted text-sm mb-4">Select a date, guest count, and duration to see availability.</p>
        
        {error && <div className="text-danger mb-4 text-sm mt-2">{error}</div>}
        
        <div className="flex gap-4 mb-6" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group mb-0" style={{ minWidth: '200px' }}>
            <label className="form-label flex items-center gap-2"><CalendarDays size={16}/> Date</label>
            <input type="date" className="form-input" required value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group mb-0" style={{ minWidth: '150px' }}>
            <label className="form-label flex items-center gap-2"><Users size={16}/> Guests</label>
            <input type="number" min="1" max="10" className="form-input" required value={guests} onChange={(e) => setGuests(parseInt(e.target.value) || 1)} />
          </div>
          <div className="form-group mb-0" style={{ minWidth: '150px' }}>
            <label className="form-label flex items-center gap-2"><Clock size={16}/> Duration (Hours)</label>
            <input type="number" min="1" max="12" className="form-input" required value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 1)} />
          </div>
        </div>

        {loadingAvailability ? (
          <div className="text-center text-muted py-6">Checking availability...</div>
        ) : availability ? (
          <div>
            {suitableTables.length === 0 ? (
              <div className="text-muted">No tables available for {guests} guests.</div>
            ) : (
              <div className="grid-container" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Table</th>
                      {timeSlots.map(t => <th key={t} className="text-center">{format12H(t)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {suitableTables.map(table => (
                      <tr key={table._id}>
                        <td className="font-medium">Table {table.tableNumber} <span className="text-muted text-sm">({table.capacity} seats)</span></td>
                        {timeSlots.map(time => {
                          const booked = isSlotBooked(table._id, time);
                          return (
                            <td key={time} className="text-center">
                              {booked ? (
                                <button className="btn btn-outline w-100 disabled text-sm" style={{ width: '100%', borderColor: 'var(--border)', color: 'var(--text-muted)' }} disabled>
                                  Booked
                                </button>
                              ) : (
                                <button 
                                  className="btn btn-primary w-100 text-sm" 
                                  style={{ width: '100%', padding: '0.25rem' }} 
                                  onClick={() => handleBook(table._id, time)}
                                  disabled={loadingBook}
                                >
                                  Available
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Existing Reservations Section */}
      <div className="card">
        <h3>Your Reservations</h3>
        
        {reservations.length === 0 ? (
          <div className="text-center text-muted py-6">You have no reservations yet.</div>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            {reservations.map((res) => {
               const startH = parseInt(res.timeSlot.split(':')[0], 10);
               const endH = startH + (res.duration || 1);
               const timeString = `${format12H(startH + ':00')} to ${format12H(endH + ':00')}`;

               return (
                <div key={res._id} className="card flex justify-between items-center" style={{ padding: '1rem', backgroundColor: 'var(--surface-hover)' }}>
                  <div>
                    <div className="font-medium mb-1">
                      {new Date(res.date).toLocaleDateString()} &mdash; <span style={{ color: 'var(--primary)' }}>{timeString}</span>
                    </div>
                    <div className="text-sm text-muted flex gap-4">
                      <span className="flex items-center gap-1"><Users size={14}/> {res.guests} Guests</span>
                      <span className="flex items-center gap-1"><Utensils size={14}/> Table {res.table?.tableNumber}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', padding: '0.25rem 0.5rem' }} onClick={() => setEditingReservation(res)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.25rem 0.5rem' }} onClick={() => cancelReservation(res._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
               );
            })}
          </div>
        )}
      </div>

      {editingReservation && (
        <EditModal 
          reservation={editingReservation} 
          tables={availability?.tables || []} 
          onClose={() => setEditingReservation(null)}
          onSaved={() => {
            setEditingReservation(null);
            fetchReservations();
            fetchAvailability();
          }}
        />
      )}

    </div>
  );
};

export default CustomerDashboard;
