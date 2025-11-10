import React, { useState } from "react";
import "../styles/AdminDashboard.css";
import MenuManager from "./MenuManager";
import OrderBoard from "./OrderBoard";
import ReservationPanel from "./ReservationPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("menu");
  const { user, logout } = useAuth();

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>🍽️ Smart Admin Panel</h1>
          <span className="admin-user">Welcome, {user?.email}</span>
        </div>
        <div className="admin-actions">
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button className={activeTab === "menu" ? "tab active" : "tab"} onClick={() => setActiveTab("menu")}>📋 Menu</button>
        <button className={activeTab === "orders" ? "tab active" : "tab"} onClick={() => setActiveTab("orders")}>🧾 Orders</button>
        <button className={activeTab === "reservations" ? "tab active" : "tab"} onClick={() => setActiveTab("reservations")}>📅 Reservations</button>
        <button className={activeTab === "analytics" ? "tab active" : "tab"} onClick={() => setActiveTab("analytics")}>📊 Analytics</button>
      </nav>

      <main className="admin-content">
        {activeTab === "menu" && <MenuManager />}
        {activeTab === "orders" && <OrderBoard />}
        {activeTab === "reservations" && <ReservationPanel />}
        {activeTab === "analytics" && <AnalyticsPanel />}
      </main>
    </div>
  );
}

export default AdminDashboard;
