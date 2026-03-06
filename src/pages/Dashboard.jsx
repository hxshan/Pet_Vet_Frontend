import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, Clock, Syringe, Loader, AlertCircle } from 'lucide-react';
import '../assets/styles/dashboard.css';
import { useAuth } from '../context/useAuth.js';
import { apiFetch } from '../utils/api.js';

/* ── helpers ── */
const fmtTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.firstname || user?.name || 'Doctor';

  const [kpis, setKpis]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const res = await apiFetch('dashboard/vet/stats');
      if (cancelled) return;
      setLoading(false);
      if (res.ok) {
        setKpis(res.data?.data ?? res.data);
      } else {
        setError(res.data?.message || 'Could not load dashboard data.');
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  /* ── build stat cards from live data ── */
  const stats = [
    {
      id: 1,
      label: "Today's Appointments",
      value: kpis ? String(kpis.todayAppointmentCount ?? 0) : '—',
      icon: Calendar,
      color: 'blue',
      change: kpis?.pendingConfirmationCount
        ? `${kpis.pendingConfirmationCount} awaiting confirmation`
        : 'No pending confirmations',
    },
    {
      id: 2,
      label: 'Pending Confirmation',
      value: kpis ? String(kpis.pendingConfirmationCount ?? 0) : '—',
      icon: Clock,
      color: 'orange',
      change: 'Booked, not yet confirmed',
    },
    {
      id: 3,
      label: 'Completed (All Time)',
      value: kpis ? String(kpis.completedAllTime ?? 0) : '—',
      icon: CheckCircle,
      color: 'green',
      change: 'Total appointments completed',
    },
    {
      id: 4,
      label: 'Vaccines Due Soon',
      value: kpis ? String(kpis.vaccinesDueSoon ?? 0) : '—',
      icon: Syringe,
      color: 'purple',
      change: 'Due within the next 7 days',
    },
  ];

  const upcomingAppointments = kpis?.upcomingAppointments ?? [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Welcome back, {displayName}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="dashboard-loading">
          <Loader size={28} className="dashboard-spinner" />
          <p>Loading stats…</p>
        </div>
      ) : error ? (
        <div className="dashboard-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : (
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
                <div className="stat-change">{stat.change}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming Appointments */}
      {!loading && !error && (
        <div className="dashboard-grid">
          <div className="appointments-section">
            <div className="section-header">
              <h2 className="section-title">Upcoming Appointments</h2>
            </div>
            <div className="section-content">
              {upcomingAppointments.length === 0 ? (
                <div className="dashboard-empty">
                  <Calendar size={28} className="dashboard-empty-icon" />
                  <p>No upcoming appointments.</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {upcomingAppointments.map((appt) => {
                    const petName = appt.pet?.name ?? 'Unknown';
                    const species = appt.pet?.species ?? '';
                    const breed   = appt.pet?.breed   ?? '';
                    const petLabel = breed
                      ? `${petName} (${breed})`
                      : species
                        ? `${petName} (${species})`
                        : petName;
                    const ownerFirst = appt.petOwner?.firstname ?? '';
                    const ownerLast  = appt.petOwner?.lastname  ?? '';
                    const ownerLabel = `${ownerFirst} ${ownerLast}`.trim() || appt.petOwner?.email || '—';
                    const dateLabel  = fmtDate(appt.startTime);
                    const timeLabel  = fmtTime(appt.startTime);

                    return (
                      <div key={appt.id} className="appointment-card">
                        <div className="appointment-time">
                          <div className="time-text">{timeLabel}</div>
                          <div className="time-date">{dateLabel}</div>
                        </div>
                        <div className="appointment-details">
                          <div className="patient-name">{petLabel}</div>
                          <div className="owner-name">{ownerLabel}</div>
                        </div>
                        <div className={`appointment-type appt-status--${(appt.status ?? '').toLowerCase()}`}>
                          {appt.confirmationStatus ?? appt.status ?? 'Booked'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Vaccines Due Card */}
          <div className="alerts-section">
            <div className="section-header">
              <h2 className="section-title">Vaccines Due Soon</h2>
            </div>
            <div className="section-content">
              {kpis?.vaccinesDueSoon > 0 ? (
                <div className="alert-card alert-medium">
                  <div className="alert-content">
                    <Syringe className="alert-icon" />
                    <p className="alert-message">
                      <strong>{kpis.vaccinesDueSoon}</strong> vaccination
                      {kpis.vaccinesDueSoon !== 1 ? 's' : ''} due within the next 7 days across
                      your patients. Check the Medical Records page for details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="alert-card alert-low">
                  <div className="alert-content">
                    <CheckCircle className="alert-icon" />
                    <p className="alert-message">All vaccinations are up to date.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;