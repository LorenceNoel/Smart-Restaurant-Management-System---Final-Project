const API_BASE_URL = 'http://localhost:5000/api';

export async function getReservations() {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`);
    const data = await response.json();
    
    if (data.success) {
      return data.data.map(reservation => ({
        id: reservation.ReservationID,
        name: reservation.CustomerName,
        email: reservation.CustomerEmail,
        date: reservation.ReservationDate,
        time: reservation.ReservationTime,
        guests: reservation.NumberOfGuests,
        status: reservation.Status,
        specialRequests: reservation.SpecialRequests
      }));
    } else {
      console.error('Failed to fetch reservations:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
}

export async function getAvailableTimeSlots(date, guests) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/available-slots?date=${date}&guests=${guests}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data.availableSlots;
    } else {
      console.error('Failed to fetch available slots:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return [];
  }
}

export async function createReservation(reservationData) {
  try {
    // Combine enhanced fields into special requests for database compatibility
    let combinedSpecialRequests = '';
    
    if (reservationData.occasion) {
      combinedSpecialRequests += `Occasion: ${reservationData.occasion}\n`;
    }
    
    if (reservationData.dietaryRestrictions) {
      combinedSpecialRequests += `Dietary Restrictions: ${reservationData.dietaryRestrictions}\n`;
    }
    
    if (reservationData.tablePreference) {
      combinedSpecialRequests += `Table Preference: ${reservationData.tablePreference}\n`;
    }
    
    if (reservationData.notes) {
      combinedSpecialRequests += `Additional Notes: ${reservationData.notes}\n`;
    }

    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: reservationData.userId || null,
        customerName: reservationData.name,
        customerEmail: reservationData.email,
        customerPhone: reservationData.phone || null,
        reservationDate: reservationData.date,
        reservationTime: reservationData.time,
        numberOfGuests: reservationData.guests,
        specialRequests: combinedSpecialRequests.trim() || null
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, reservationId: data.data.reservationId };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Error creating reservation:', error);
    return { success: false, error: 'Failed to create reservation' };
  }
}

export async function updateReservationStatus(id, status, tableNumber = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        tableNumber
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`Reservation ${id} updated to: ${status}`);
      return true;
    } else {
      console.error('Failed to update reservation status:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return false;
  }
}
