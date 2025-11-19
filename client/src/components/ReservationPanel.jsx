import React, { useState, useEffect } from "react";
import { getReservations, updateReservation } from "../services/reservationService";
import "../styles/AdminDashboard.css";
import { useAuth } from "../context/AuthContext";

function ReservationPanel() {
  const [reservations, setReservations] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    async function loadReservations() {
      const data = await getReservations(token);
      setReservations(data);
    }
    loadReservations();
  }, [token]);

  const updateStatus = async (id, newStatus) => {
    const updated = await updateReservation(id, { status: newStatus }, token);
    setReservations(reservations.map(res => (res.id === id ? updated : res)));
  };

  return (
    <div className="panel">
      <h2>📅 Reservation Manager</h2>
      <div className="panel-section">
        {reservations.map(res => (
          <div key={res.id} className="panel-card">
            <h3>{res.name}</h3>
            <p>Date: {res.date}</p>
            <p>Time: {res.time}</p>
            <p>Guests: {res.guests}</p>
            <p>Status: {res.status || "Pending"}</p>
            <div className="button-group">
              <button onClick={() => updateStatus(res.id, "Approved")}>Approve</button>
              <button onClick={() => updateStatus(res.id, "Cancelled")}>Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReservationPanel;