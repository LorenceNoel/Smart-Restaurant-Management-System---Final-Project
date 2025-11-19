import React, { useState } from "react";
import "../styles/ReservationPage.css";
import { createReservation } from "../services/reservationService";
import { useAuth } from "../context/AuthContext";

function ReservationPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    guests: 1,
    notes: "",
  });
  const [message, setMessage] = useState("");
  const { token } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createReservation(formData, token);
      setMessage("Reservation submitted successfully!");
      setFormData({ name: "", email: "", date: "", time: "", guests: 1, notes: "" });
      console.log("Reservation created:", result);
    } catch (err) {
      setMessage("Error submitting reservation. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="reservation-page">
      <h1>Make a Reservation</h1>
      <form className="reservation-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="guests"
          min="1"
          max="20"
          value={formData.guests}
          onChange={handleChange}
          required
        />
        <textarea
          name="notes"
          placeholder="Special requests (optional)"
          value={formData.notes}
          onChange={handleChange}
        />
        <button type="submit">Reserve Table</button>
      </form>
      {message && <p className="reservation-message">{message}</p>}
    </div>
  );
}

export default ReservationPage;