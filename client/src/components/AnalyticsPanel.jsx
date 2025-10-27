import React from "react";
import { getAnalytics } from "../services/analyticsService";
import "../styles/AdminDashboard.css";

function AnalyticsPanel() {
  const analytics = getAnalytics();

  const stats = [
    { label: "Total Orders Today", value: analytics.totalOrders },
    { label: "Most Popular Item", value: analytics.popularItem },
    { label: "Average Rating", value: `${analytics.averageRating} / 5` },
  ];

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