export function getReservations() {
  return [
    { id: 201, name: "Charlie", time: "6:00 PM", status: "Pending" },
    { id: 202, name: "Dana", time: "7:30 PM", status: "Approved" },
    { id: 203, name: "Eli", time: "8:15 PM", status: "Pending" },
  ];
}

export function updateReservationStatus(id, status) {
  console.log(`Reservation ${id} updated to: ${status}`);
}