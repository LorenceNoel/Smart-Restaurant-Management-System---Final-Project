import React, { useState, useEffect } from "react";
import {
  getReservations,
  updateReservationStatus,
} from "../services/reservationService";
import "../styles/AdminDashboard.css";

function ReservationPanel() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const data = await getReservations();
        setReservations(data);
      } catch (error) {
        console.error('Error loading reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const success = await updateReservationStatus(id, newStatus);
    
    if (success) {
      const updated = reservations.map((res) =>
        res.id === id ? { ...res, status: newStatus } : res
      );
      setReservations(updated);
    } else {
      alert('Failed to update reservation status');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#ffa500';
      case 'approved': return '#4caf50';
      case 'confirmed': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'completed': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <h2>📅 Reservation Manager</h2>
        <p>Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>📅 Reservation Manager</h2>
      <div className="panel-section">
        {reservations.map((res) => (
          <div key={res.id} className="panel-card" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📅 {res.name}
                </h3>
                <p style={{ margin: '2px 0', color: '#666' }}>
                  <strong>Date:</strong> {formatDate(res.date)}
                </p>
                <p style={{ margin: '2px 0', color: '#666' }}>
                  <strong>Time:</strong> {res.time}
                </p>
                <p style={{ margin: '2px 0', color: '#666' }}>
                  <strong>Guests:</strong> {res.guests}
                </p>
                {res.email && (
                  <p style={{ margin: '2px 0', color: '#666' }}>
                    <strong>Email:</strong> {res.email}
                  </p>
                )}
                {res.specialRequests && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#888' }}>
                    <strong>Notes:</strong> {res.specialRequests}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  backgroundColor: getStatusColor(res.status), 
                  color: 'white', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  {res.status}
                </div>
              </div>
            </div>
            <div className="button-group" style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => updateStatus(res.id, "Approved")}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Approve
              </button>
              <button 
                onClick={() => updateStatus(res.id, "Cancelled")}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#f44336',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReservationPanel;
