import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, User, Phone, Settings, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { AvailabilityModal } from '../components/AvailabilityModal.jsx';
import '../assets/styles/appointments.css';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/useAuth.js';

export function Appointments() {
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    // If user is a vet, fetch vet appointments from backend
    const fetchAppointments = async () => {
      if (!auth || !auth.user) return;
      const roles = auth.user.roles || auth.user.role || [];
      const isVet = Array.isArray(roles) ? roles.includes('VETERINARIAN') : roles === 'VETERINARIAN';
      if (!isVet) return;
      setLoading(true);
      const res = await apiFetch('appointments/vets/my');
      setLoading(false);
      if (res.ok && res.data && Array.isArray(res.data.appointments)) {
        setAppointments(res.data.appointments.map(a => ({ ...a, statusLabel: a.confirmationStatus || a.status })));
      } else {
        console.warn('Failed to load appointments', res);
      }
    };
    fetchAppointments();
  }, [auth]);

  // appointments state fetched from backend (or empty)

  // Prepare a simple list of appointments for the day (sorted)
  const todaysAppointments = appointments
    .slice()
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const confirmedCount = appointments.filter((a) => (a.confirmationStatus === 'CONFIRMED' || a.status === 'COMPLETED')).length;
  const pendingCount = appointments.filter((a) => (a.confirmationStatus === 'PENDING' || a.status === 'BOOKED')).length;
  const cancelledCount = appointments.filter((a) => (a.confirmationStatus === 'DECLINED' || a.status === 'CANCELLED')).length;

  // Get next 3 upcoming appointments
  const upcomingAppointments = todaysAppointments.slice(0, 3);

  const refreshAppointments = async () => {
    const res = await apiFetch('appointments/vets/my');
    if (res.ok && res.data && Array.isArray(res.data.appointments)) {
      setAppointments(res.data.appointments.map(a => ({ ...a, statusLabel: a.confirmationStatus || a.status })));
    }
  };

  const handleConfirm = async (id) => {
    const res = await apiFetch(`appointments/${id}/confirm`, { method: 'POST' });
    if (res.ok) {
      await refreshAppointments();
    } else {
      alert('Failed to confirm appointment');
    }
  };

  const handleDecline = async (id) => {
    const reason = window.prompt('Optional message to owner for declining:');
    const res = await apiFetch(`appointments/${id}/decline`, { method: 'POST', body: { message: reason } });
    if (res.ok) {
      await refreshAppointments();
    } else {
      alert('Failed to decline appointment');
    }
  };

  const handleRequestReschedule = async (id) => {
    const suggested = window.prompt('Suggest a new start time (ISO format e.g. 2026-01-25T10:00:00Z)');
    if (!suggested) return;
    const res = await apiFetch(`appointments/${id}/reschedule`, { method: 'POST', body: { startTime: suggested } });
    if (res.ok) {
      await refreshAppointments();
    } else {
      alert('Failed to request reschedule');
    }
  };

  return (
    <div className="appointments-page">
      {/* Header */}
      <div className="appointments-header">
        <h1 className="appointments-title">Appointments</h1>
        <p className="appointments-subtitle">Manage your daily schedule and appointments</p>
      </div>

      {/* Controls */}
      <div className="appointments-controls">
        <div className="appointments-date-nav">
          <button className="appointments-nav-btn" onClick={handlePreviousDay}>
            <ChevronLeft size={16} />
            Previous
          </button>
          <div className="appointments-current-date">
            <Calendar size={20} />
            {formatDate(currentDate)}
          </div>
          <button className="appointments-nav-btn" onClick={handleNextDay}>
            Next
            <ChevronRight size={16} />
          </button>
          <button className="appointments-nav-btn" onClick={handleToday}>
            Today
          </button>
        </div>

        <div className="appointments-action-buttons">
          <button
            className="appointments-btn appointments-btn-settings"
            onClick={() => setIsAvailabilityModalOpen(true)}
          >
            <Settings size={18} />
            Set Availability
          </button>

        </div>
      </div>

      {/* Main Layout */}
      <div className="appointments-layout">
        {/* Schedule */}
        <div className="appointments-schedule-card">
          <div className="appointments-schedule-header">
            <h2>Today's Schedule</h2>
          </div>
          <div className="appointments-schedule-content">
            {loading && <div style={{padding:20}}>Loading appointments...</div>}
            {!loading && todaysAppointments.length === 0 && (
              <div style={{padding:20,color:'#9ca3af'}}>No appointments for today</div>
            )}
            {todaysAppointments.map((apt) => (
              <div key={apt._id} className="appointments-time-slot">
                <div className="appointments-time-label">{new Date(apt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="appointments-slot-content">
                  <div className="appointments-card">
                    <div className="appointments-card-header">
                      <div>
                        <h3 className="appointments-card-patient">{apt.pet?.name || 'Unknown'}</h3>
                        <p className="appointments-card-species">{apt.pet?.species || ''} {apt.pet?.breed ? `(${apt.pet.breed})` : ''}</p>
                      </div>
                      <span className={`appointments-status-badge appointments-status-${(apt.confirmationStatus||apt.status||'').toLowerCase()}`}>{apt.confirmationStatus || apt.status}</span>
                    </div>

                    <div className="appointments-card-info">
                      <div className="appointments-card-detail"><User size={16} />{apt.petOwner?.firstname} {apt.petOwner?.lastname}</div>
                      <div className="appointments-card-detail"><Phone size={16} />{apt.petOwner?.phone}</div>
                      <div className="appointments-card-detail"><Clock size={16} />{apt.reason || 'Appointment'}</div>
                    </div>

                    <div className="appointments-card-actions">
                      {apt.confirmationStatus === 'PENDING' && (
                        <button className="appointments-card-btn appointments-card-btn-confirm" onClick={() => handleConfirm(apt._id)}><Check size={14}/>Confirm</button>
                      )}
                      <button className="appointments-card-btn appointments-card-btn-reschedule" onClick={() => handleRequestReschedule(apt._id)}>Reschedule</button>
                      <button className="appointments-card-btn appointments-card-btn-cancel" onClick={() => handleDecline(apt._id)}><X size={14}/>Decline</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="appointments-sidebar">
          {/* Summary */}
          <div className="appointments-summary-card">
            <h3>Today's Summary</h3>
            <div className="appointments-summary-stats">
              <div className="appointments-stat-item">
                <span className="appointments-stat-label">Total</span>
                <span className="appointments-stat-value appointments-stat-value-primary">
                  {appointments.length}
                </span>
              </div>
              <div className="appointments-stat-item">
                <span className="appointments-stat-label">Confirmed</span>
                <span className="appointments-stat-value appointments-stat-value-success">
                  {confirmedCount}
                </span>
              </div>
              <div className="appointments-stat-item">
                <span className="appointments-stat-label">Pending</span>
                <span className="appointments-stat-value appointments-stat-value-warning">
                  {pendingCount}
                </span>
              </div>
              {cancelledCount > 0 && (
                <div className="appointments-stat-item">
                  <span className="appointments-stat-label">Cancelled</span>
                  <span className="appointments-stat-value appointments-stat-value-danger">
                    {cancelledCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div className="appointments-upcoming-card">
            <h3>Next Up</h3>
            <div className="appointments-upcoming-list">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="appointments-upcoming-item">
                    <div className="appointments-upcoming-time">{apt.time}</div>
                    <div className="appointments-upcoming-patient">{apt.patient}</div>
                    <div className="appointments-upcoming-type">{apt.type}</div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center' }}>
                  No upcoming appointments
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        onSave={(settings) => {
          console.log('Availability settings saved:', settings);
          // Refresh appointments after availability change
          refreshAppointments();
        }}
      />
    </div>
  );
}
