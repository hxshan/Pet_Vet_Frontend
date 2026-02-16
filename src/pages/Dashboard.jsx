import React from 'react';
import { Calendar, Users, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import '../assets/styles/dashboard.css';
import { useAuth } from '../context/useAuth.js';

function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.firstname || user?.name || 'Dr. Johnson';
  const stats = [
    {
      id: 1,
      label: 'Today\'s Appointments',
      value: '12',
      icon: Calendar,
      color: 'blue',
      change: '+2 from yesterday',
    },
    {
      id: 2,
      label: 'Active Patients',
      value: '248',
      icon: Users,
      color: 'green',
      change: '+15 this month',
    },
    {
      id: 3,
      label: 'Revenue (Monthly)',
      value: '$18,450',
      icon: DollarSign,
      color: 'purple',
      change: '+12% from last month',
    },
    {
      id: 4,
      label: 'Pending Tasks',
      value: '7',
      icon: Clock,
      color: 'orange',
      change: '3 urgent',
    },
  ];

  const upcomingAppointments = [
    { id: 1, time: '09:00 AM', patient: 'Max (Golden Retriever)', owner: 'John Smith', type: 'Check-up' },
    { id: 2, time: '10:30 AM', patient: 'Luna (Persian Cat)', owner: 'Emily Davis', type: 'Vaccination' },
    { id: 3, time: '11:15 AM', patient: 'Charlie (Beagle)', owner: 'Michael Brown', type: 'Surgery Follow-up' },
    { id: 4, time: '02:00 PM', patient: 'Bella (Labrador)', owner: 'Sarah Wilson', type: 'Dental Cleaning' },
  ];

  const recentAlerts = [
    { id: 1, message: 'Medication stock low: Antibiotics', priority: 'high' },
    { id: 2, message: 'Lab results ready for review (3 patients)', priority: 'medium' },
    { id: 3, message: 'Equipment maintenance due next week', priority: 'low' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back, {displayName}. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.id} className="stat-card">
              <div className="stat-card-header">
                <div className={`stat-icon stat-icon-${stat.color}`}>
                  <Icon className="icon" />
                </div>
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-change">
                <TrendingUp className="icon-sm" />
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        {/* Upcoming Appointments */}
        <div className="appointments-section">
          <div className="section-header">
            <h2 className="section-title">Upcoming Appointments</h2>
          </div>
          <div className="section-content">
            <div className="appointments-list">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-time">
                    <div className="time-text">{appointment.time}</div>
                  </div>
                  <div className="appointment-details">
                    <div className="patient-name">{appointment.patient}</div>
                    <div className="owner-name">{appointment.owner}</div>
                  </div>
                  <div className="appointment-type">
                    {appointment.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="alerts-section">
          <div className="section-header">
            <h2 className="section-title">Alerts & Notifications</h2>
          </div>
          <div className="section-content">
            <div className="alerts-list">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className={`alert-card alert-${alert.priority}`}>
                  <div className="alert-content">
                    <AlertCircle className="alert-icon" />
                    <p className="alert-message">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;