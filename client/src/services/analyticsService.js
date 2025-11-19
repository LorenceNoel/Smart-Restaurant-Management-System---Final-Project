// For now, analytics can just reuse orders and reservations.
// Later you can add custom backend endpoints.

import { getOrders } from "./orderService.js";
import { getReservations } from "./reservationService.js";

export async function getAnalytics(token) {
  const orders = await getOrders(token);
  const reservations = await getReservations(token);

  return {
    totalOrders: orders.length,
    totalReservations: reservations.length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
  };
}