import React, { useEffect, useState } from "react";
import { getAnalytics } from "../services/analyticsService";
import "../styles/AdminDashboard.css";
import { useAuth } from "../context/AuthContext";

function AnalyticsPanel() {
  const [stats, setStats] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    async function load() {
      const data = await getAnalytics(token);
      setStats([
        { label: "Total Orders", value: data.totalOrders },
        { label: "Total Reservations", value: data.totalReservations },
        { label: "Revenue", value: `$${data.revenue}` }
      ]);
    }
    load();
  }, [token]);

  if (!stats) return <p>Loading analytics...</p>;

  return (
    <div className="panel">
      <h2>📊 Analytics Overview</h2>
      <div className="panel-section">
        {stats.map((stat, index) => (
          <div key={index} className="panel-card">
            <h3>{stat.label}</h3>
            <p>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnalyticsPanel;