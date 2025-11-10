import React, { useState, useEffect } from "react";
import { getAnalytics } from "../services/analyticsService";
import "../styles/AdminDashboard.css";

function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="panel">
        <h2>📊 Analytics Overview</h2>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="panel">
        <h2>📊 Analytics Overview</h2>
        <p>No analytics data available.</p>
      </div>
    );
  }

  const stats = [
    { 
      label: "Total Orders Today", 
      value: analytics.totalOrders || 0,
      icon: "📦",
      color: "#2196f3",
      bgColor: "#e3f2fd"
    },
    { 
      label: "Total Revenue", 
      value: `$${analytics.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: "💰",
      color: "#4caf50",
      bgColor: "#e8f5e8"
    },
    { 
      label: "Average Order Value", 
      value: `$${analytics.averageOrderValue?.toFixed(2) || '0.00'}`,
      icon: "📊",
      color: "#9c27b0",
      bgColor: "#f3e5f5"
    },
    { 
      label: "Most Popular Item", 
      value: analytics.popularItem || "No data",
      icon: "🔥",
      color: "#ff9800",
      bgColor: "#fff3e0"
    },
  ];

  return (
    <div className="panel">
      <h2>📊 Analytics Overview</h2>
      <div className="panel-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="panel-card" 
            style={{
              background: `linear-gradient(135deg, ${stat.bgColor} 0%, white 100%)`,
              border: `2px solid ${stat.color}20`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
              {stat.icon}
            </div>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: stat.color, 
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {stat.label}
            </h3>
            <p style={{ 
              margin: '0', 
              fontSize: '1.8rem', 
              fontWeight: 'bold', 
              color: '#333',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}>
              {stat.value}
            </p>
            {analytics.popularItemQuantity && index === 3 && (
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '12px', 
                color: '#666',
                fontStyle: 'italic'
              }}>
                Ordered {analytics.popularItemQuantity} times
              </p>
            )}
          </div>
        ))}
      </div>
      
      {/* Quick Status Overview */}
      {analytics.orderStatuses && analytics.orderStatuses.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '12px', color: '#333' }}>📋 Order Status Overview</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {analytics.orderStatuses.map((status, index) => (
              <div 
                key={index}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: status.Status === 'Pending' ? '#fff3cd' : 
                                   status.Status === 'Preparing' ? '#cce7ff' :
                                   status.Status === 'Ready' ? '#d4edda' : 
                                   status.Status === 'Delivered' ? '#e2e3e5' : '#f8d7da',
                  color: status.Status === 'Pending' ? '#856404' : 
                         status.Status === 'Preparing' ? '#004085' :
                         status.Status === 'Ready' ? '#155724' : 
                         status.Status === 'Delivered' ? '#383d41' : '#721c24',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                {status.Status}: {status.Count}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPanel;
