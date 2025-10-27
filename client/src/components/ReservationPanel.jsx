import React, { useState, useEffect } from "react";
import {
  getReservations,
  updateReservationStatus,
} from "../services/reservationService";
import "../styles/AdminDashboard.css";

function ReservationPanel() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const data = getReservations();
    setReservations(data);
  }, []);

  const updateStatus = (id, newStatus) => {
    const updated = reservations.map((res) =>
      res.id === id ? { ...res, status: newStatus } : res
    );
    setReservations(updated);
    updateReservationStatus(id, newStatus);
  };

  return (
    <div className="panel">
      <h2>📅 Reservation Manager</h2>
      <div className="panel-section">
        {reservations.map((res) => (
          <div key={res.id} className="panel-card">
            <h3>{res.name}</h3>
            <p>Time: {res.time}</p>
            <p>Status: {res.status}</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
            <div className="button-group">
  <button onClick={() => updateStatus(res.id, "Approved")}>Approve</button>
  <button onClick={() => updateStatus(res.id, "Cancelled")}>Cancel</button>
</div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReservationPanel;