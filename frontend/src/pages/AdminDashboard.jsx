import React, { useState, useEffect } from 'react';
import api from '../api';
import { Trash2, Plus } from 'lucide-react';
import { format12H } from '../utils';

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  
  // Table form state
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('');

  const fetchReservations = async () => {
    try {
      const url = filterDate ? `/reservations/admin/all?date=${filterDate}` : '/reservations/admin/all';
      const { data } = await api.get(url);
      setReservations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTables = async () => {
    try {
      const { data } = await api.get('/reservations/admin/tables');
      setTables(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchTables();

    const intervalId = setInterval(() => {
      fetchReservations();
      fetchTables();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [filterDate]);

  const cancelReservation = async (id) => {
    if (window.confirm('Delete this reservation?')) {
      try {
        await api.delete(`/reservations/${id}`);
        fetchReservations();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations/admin/tables', { tableNumber: Number(tableNumber), capacity: Number(capacity) });
      setTableNumber('');
      setCapacity('');
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding table');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      
      {/* Tables Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3>Table Management</h3>
        </div>
        
        <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>
          <form onSubmit={handleAddTable} className="flex gap-4 items-end" style={{ flex: 1 }}>
            <div className="form-group mb-0" style={{ flex: 1 }}>
              <label className="form-label">Table Number</label>
              <input type="number" className="form-input" required value={tableNumber} onChange={e => setTableNumber(e.target.value)} />
            </div>
            <div className="form-group mb-0" style={{ flex: 1 }}>
              <label className="form-label">Capacity (Guests)</label>
              <input type="number" className="form-input" required value={capacity} onChange={e => setCapacity(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary flex items-center gap-2"><Plus size={16}/> Add Table</button>
          </form>

          <div style={{ flex: 1 }}>
            <div className="flex flex-wrap gap-2">
              {tables.map(t => (
                <div key={t._id} className="badge" style={{ backgroundColor: 'var(--surface-hover)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  T-{t.tableNumber} <span className="text-muted ml-2">({t.capacity} seats)</span>
                </div>
              ))}
              {tables.length === 0 && <span className="text-muted text-sm">No tables seeded yet. Add some to start accepting reservations.</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Reservations Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3>All Reservations</h3>
          <input 
            type="date" 
            className="form-input" 
            style={{ width: 'auto' }} 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time (Duration)</th>
                <th>User</th>
                <th>Guests</th>
                <th>Table</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => {
                const startH = parseInt(res.timeSlot.split(':')[0], 10);
                const endH = startH + (res.duration || 1);
                const timeString = `${format12H(startH + ':00')} - ${format12H(endH + ':00')}`;
                return (
                <tr key={res._id}>
                  <td>{new Date(res.date).toLocaleDateString()}</td>
                  <td>{timeString}</td>
                  <td>{res.user?.email}</td>
                  <td>{res.guests}</td>
                  <td>T-{res.table?.tableNumber}</td>
                  <td>
                    <button className="btn btn-outline text-danger" style={{ padding: '0.25rem 0.5rem', borderColor: 'var(--danger)' }} onClick={() => cancelReservation(res._id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )})}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>No reservations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
