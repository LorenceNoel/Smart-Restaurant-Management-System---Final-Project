import React, { useState, useEffect } from "react";
import { createReservation, getAvailableTimeSlots } from "../services/reservationService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";
import Input from "../components/Input";
import '../styles/ReservationPage.css';

function ReservationPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: 2,
    occasion: "",
    dietaryRestrictions: "",
    tablePreference: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const toast = useToast();

  // Restaurant configuration
  const RESTAURANT_HOURS = {
    open: '11:00',
    close: '22:00',
    closedDays: [0], // Monday = 1, Sunday = 0
  };

  const TIME_SLOTS = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  const OCCASIONS = [
    { value: '', label: 'Regular dining' },
    { value: 'birthday', label: 'Birthday celebration' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'business', label: 'Business meeting' },
    { value: 'romantic', label: 'Romantic dinner' },
    { value: 'family', label: 'Family gathering' },
    { value: 'other', label: 'Other special occasion' }
  ];

  const TABLE_PREFERENCES = [
    { value: '', label: 'No preference' },
    { value: 'window', label: 'Window seat' },
    { value: 'quiet', label: 'Quiet area' },
    { value: 'booth', label: 'Booth seating' },
    { value: 'outdoor', label: 'Outdoor patio' },
    { value: 'bar', label: 'Bar seating' }
  ];

  // Auto-fill user data when logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Load available time slots when date changes
  useEffect(() => {
    if (formData.date && formData.guests) {
      loadAvailableSlots();
    }
  }, [formData.date, formData.guests]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      // In a real app, this would call the backend
      // For now, we'll simulate availability checking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const isToday = selectedDate.toDateString() === today.toDateString();
      
      let availableSlots = TIME_SLOTS.filter(slot => {
        if (isToday) {
          const [hours, minutes] = slot.split(':');
          const slotTime = new Date();
          slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return slotTime > new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours advance notice
        }
        return true;
      });

      // Simulate some slots being unavailable
      if (formData.guests > 6) {
        availableSlots = availableSlots.filter((_, index) => index % 3 !== 0);
      }

      setAvailableSlots(availableSlots);
    } catch (error) {
      toast.error('Failed to load available time slots');
      setAvailableSlots(TIME_SLOTS);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Reset time when date changes
    if (name === 'date') {
      setFormData(prev => ({ ...prev, time: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Please select a future date';
      }
      
      // Check if restaurant is closed on selected day
      if (RESTAURANT_HOURS.closedDays.includes(selectedDate.getDay())) {
        newErrors.date = 'Restaurant is closed on Mondays';
      }
      
      // Don't allow reservations more than 60 days in advance
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 60);
      if (selectedDate > maxDate) {
        newErrors.date = 'Reservations can only be made up to 60 days in advance';
      }
    }

    // Time validation
    if (!formData.time) {
      newErrors.time = 'Please select a time slot';
    } else if (!availableSlots.includes(formData.time)) {
      newErrors.time = 'Selected time slot is not available';
    }

    // Guests validation
    if (!formData.guests || formData.guests < 1) {
      newErrors.guests = 'Number of guests is required';
    } else if (formData.guests > 20) {
      newErrors.guests = 'For parties larger than 20, please call us directly';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);

    try {
      const reservationData = {
        userId: user?.userId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        date: formData.date,
        time: formData.time,
        guests: parseInt(formData.guests),
        occasion: formData.occasion || null,
        dietaryRestrictions: formData.dietaryRestrictions.trim() || null,
        tablePreference: formData.tablePreference || null,
        notes: formData.notes.trim() || null
      };

      const result = await createReservation(reservationData);

      if (result.success) {
        toast.success("🎉 Reservation confirmed! We'll send you a confirmation email shortly.");
        
        // Reset form
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: "",
          date: "",
          time: "",
          guests: 2,
          occasion: "",
          dietaryRestrictions: "",
          tablePreference: "",
          notes: "",
        });
        setAvailableSlots([]);
      } else {
        toast.error("❌ " + result.error);
      }
    } catch (error) {
      console.error("Reservation submission error:", error);
      toast.error("❌ Failed to submit reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="reservation-page">
      <div className="reservation-header">
        <h1>Reserve Your Table</h1>
        <p>Experience fine dining at its best. Make your reservation below.</p>
      </div>

      <form className="reservation-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              icon="👤"
              placeholder="Enter your full name"
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              icon="📧"
              placeholder="your.email@example.com"
            />
          </div>
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon="📱"
            placeholder="Optional - for reservation confirmations"
          />
        </div>

        <div className="form-section">
          <h3>Reservation Details</h3>
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">
                Date <span className="input-required">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                className={`date-input ${errors.date ? 'error' : ''}`}
                required
              />
              {errors.date && <span className="input-error-message">{errors.date}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">
                Number of Guests <span className="input-required">*</span>
              </label>
              <select
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                className={`guest-select ${errors.guests ? 'error' : ''}`}
                required
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
              {errors.guests && <span className="input-error-message">{errors.guests}</span>}
            </div>
          </div>

          {formData.date && (
            <div className="time-slot-section">
              <label className="input-label">
                Available Time Slots <span className="input-required">*</span>
              </label>
              {loadingSlots ? (
                <div className="loading-slots">
                  <LoadingSpinner size="small" message="Loading available times..." />
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="time-slots">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot ${formData.time === slot ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-slots">No available time slots for the selected date and party size.</p>
              )}
              {errors.time && <span className="input-error-message">{errors.time}</span>}
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Preferences (Optional)</h3>
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Special Occasion</label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="occasion-select"
              >
                {OCCASIONS.map(occasion => (
                  <option key={occasion.value} value={occasion.value}>
                    {occasion.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Table Preference</label>
              <select
                name="tablePreference"
                value={formData.tablePreference}
                onChange={handleChange}
                className="table-select"
              >
                {TABLE_PREFERENCES.map(pref => (
                  <option key={pref.value} value={pref.value}>
                    {pref.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Dietary Restrictions"
            name="dietaryRestrictions"
            value={formData.dietaryRestrictions}
            onChange={handleChange}
            icon="🥗"
            placeholder="e.g., vegetarian, gluten-free, allergies"
          />

          <div className="input-group">
            <label className="input-label">Special Requests</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="notes-textarea"
              placeholder="Any special requests or additional information..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={submitting}
            disabled={!formData.date || !formData.time || submitting}
            fullWidth
          >
            {submitting ? 'Confirming Reservation...' : 'Confirm Reservation'}
          </Button>
          
          <p className="reservation-note">
            ℹ️ You'll receive a confirmation email once your reservation is confirmed. 
            For parties larger than 20 guests, please call us at (555) 123-4567.
          </p>
        </div>
      </form>
    </div>
  );
}

export default ReservationPage;
