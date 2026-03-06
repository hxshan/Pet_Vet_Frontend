import { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, Phone, Settings, Check, X,
  AlertCircle, CheckCircle, PawPrint,
} from 'lucide-react';
import { AvailabilityModal } from '../components/AvailabilityModal.jsx';
import { ToastContainer } from '../components/Toast.jsx';
import { useToast } from '../components/useToast.js';
import '../assets/styles/appointments.css';
import { apiFetch } from '../utils/api.js';
import { useAuth } from '../context/useAuth.js';

export function Appointments() {
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [pendingRequests,   setPendingRequests]   = useState([]);
  const [upcomingConfirmed, setUpcomingConfirmed] = useState([]);
  const [loadingPending,    setLoadingPending]    = useState(false);
  const [loadingConfirmed,  setLoadingConfirmed]  = useState(false);
  const { toasts, toast, removeToast } = useToast();
  const auth = useAuth();

  // ── Fetch helpers ──────────────────────────────────────────
  const fetchPending = async () => {
    setLoadingPending(true);
    const res = await apiFetch('appointments/vets/my/pending-confirmations');
    setLoadingPending(false);
    if (res.ok) {
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.appointments)
          ? res.data.appointments
          : [];
      setPendingRequests(
        list.slice().sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );
    } else {
      console.warn('Failed to load pending appointments', res);
    }
  };

  const fetchConfirmed = async () => {
    setLoadingConfirmed(true);
    const res = await apiFetch('appointments/vets/my');
    setLoadingConfirmed(false);
    if (res.ok) {
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.appointments)
          ? res.data.appointments
          : [];
      setUpcomingConfirmed(
        list.slice().sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );
    } else {
      console.warn('Failed to load confirmed appointments', res);
    }
  };

  useEffect(() => {
    if (!auth?.user) return;
    const load = async () => {
      await Promise.all([fetchPending(), fetchConfirmed()]);
    };
    load();
  }, [auth]);

  // ── Actions ────────────────────────────────────────────────
  const handleConfirm = async (id) => {
    const res = await apiFetch(`appointments/${id}/confirm`, { method: 'POST' });
    if (res.ok) {
      setPendingRequests(prev => prev.filter(a => a._id !== id));
      await Promise.all([fetchPending(), fetchConfirmed()]);
      toast.success('Appointment confirmed successfully.');
    } else {
      toast.error(res.data?.message || 'Failed to confirm appointment.');
    }
  };

  const handleDecline = async (id) => {
    const reason = window.prompt('Optional reason for declining (shown to owner):');
    const res = await apiFetch(`appointments/${id}/decline`, {
      method: 'POST',
      body: { message: reason || '' },
    });
    if (res.ok) {
      setPendingRequests(prev => prev.filter(a => a._id !== id));
      await fetchPending();
      toast.info('Appointment declined.');
    } else {
      toast.error(res.data?.message || 'Failed to decline appointment.');
    }
  };

  const isLoading  = loadingPending || loadingConfirmed;
  const totalCount = pendingRequests.length + upcomingConfirmed.length;

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

  const AppointmentCard = ({ apt, isPending }) => (
    <div className={`appt-card ${isPending ? 'appt-card--pending' : 'appt-card--confirmed'}`}>
      <div className="appt-card__header">
        <div className="appt-card__pet">
          <div className="appt-card__pet-icon">
            <PawPrint size={16} />
          </div>
          <div>
            <h3 className="appt-card__pet-name">{apt.pet?.name || 'Unknown'}</h3>
            <p className="appt-card__pet-species">
              {apt.pet?.species || ''}
              {apt.pet?.breed ? ` · ${apt.pet.breed}` : ''}
            </p>
          </div>
        </div>
        <div className="appt-card__datetime">
          <span className="appt-card__date">{fmtDate(apt.startTime)}</span>
          <span className="appt-card__time">{fmtTime(apt.startTime)}</span>
        </div>
      </div>

      <div className="appt-card__details">
        <div className="appt-card__detail">
          <User size={13} />
          <span>{apt.petOwner?.firstname} {apt.petOwner?.lastname}</span>
        </div>
        {apt.petOwner?.phone && (
          <div className="appt-card__detail">
            <Phone size={13} />
            <span>{apt.petOwner.phone}</span>
          </div>
        )}
        <div className="appt-card__detail">
          <Clock size={13} />
          <span>{apt.reason || 'General appointment'}</span>
        </div>
      </div>

      {isPending && (
        <div className="appt-card__actions">
          <button
            className="appt-btn appt-btn--accept"
            onClick={() => handleConfirm(apt.id)}
          >
            <Check size={14} />
            Accept
          </button>
          <button
            className="appt-btn appt-btn--decline"
            onClick={() => handleDecline(apt.id)}
          >
            <X size={14} />
            Decline
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="appointments-page">
      {/* Header */}
      <div className="appointments-header">
        <div>
          <h1 className="appointments-title">Appointments</h1>
          <p className="appointments-subtitle">
            Review incoming requests and manage your confirmed schedule
          </p>
        </div>
        <button
          className="appointments-btn appointments-btn-settings"
          onClick={() => setIsAvailabilityModalOpen(true)}
        >
          <Settings size={16} />
          Set Availability
        </button>
      </div>

      {/* Stats strip */}
      <div className="appointments-stats-strip">
        <div className="appointments-stat-pill appointments-stat-pill--total">
          <Calendar size={16} />
          <span className="appt-stat-num">{totalCount}</span>
          <span className="appt-stat-lbl">Total</span>
        </div>
        <div className="appointments-stat-pill appointments-stat-pill--pending">
          <AlertCircle size={16} />
          <span className="appt-stat-num">{pendingRequests.length}</span>
          <span className="appt-stat-lbl">Awaiting</span>
        </div>
        <div className="appointments-stat-pill appointments-stat-pill--confirmed">
          <CheckCircle size={16} />
          <span className="appt-stat-num">{upcomingConfirmed.length}</span>
          <span className="appt-stat-lbl">Confirmed</span>
        </div>
      </div>

      {isLoading ? (
        <div className="appointments-loading">
          <div className="appointments-loading-spinner" />
          <p>Loading appointments…</p>
        </div>
      ) : (
        <div className="appointments-sections">
          {/* ── Pending Requests ── */}
          <section className="appt-section">
            <div className="appt-section__header appt-section__header--pending">
              <div className="appt-section__title-row">
                <AlertCircle size={18} />
                <h2>Pending Requests</h2>
                {pendingRequests.length > 0 && (
                  <span className="appt-section__badge appt-section__badge--pending">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
              <p className="appt-section__desc">
                These appointments are waiting for your acceptance.
              </p>
            </div>

            <div className="appt-section__body">
              {pendingRequests.length === 0 ? (
                <div className="appt-empty">
                  <CheckCircle size={32} />
                  <p>No pending requests — you're all caught up!</p>
                </div>
              ) : (
                <div className="appt-grid">
                  {pendingRequests.map(apt => (
                    <AppointmentCard key={apt.id} apt={apt} isPending />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Upcoming Confirmed ── */}
          <section className="appt-section">
            <div className="appt-section__header appt-section__header--confirmed">
              <div className="appt-section__title-row">
                <CheckCircle size={18} />
                <h2>Upcoming Appointments</h2>
                {upcomingConfirmed.length > 0 && (
                  <span className="appt-section__badge appt-section__badge--confirmed">
                    {upcomingConfirmed.length}
                  </span>
                )}
              </div>
              <p className="appt-section__desc">
                Appointments you have confirmed and are scheduled.
              </p>
            </div>

            <div className="appt-section__body">
              {upcomingConfirmed.length === 0 ? (
                <div className="appt-empty">
                  <Calendar size={32} />
                  <p>No confirmed appointments yet.</p>
                </div>
              ) : (
                <div className="appt-grid">
                  {upcomingConfirmed.map(apt => (
                    <AppointmentCard key={apt.id} apt={apt} isPending={false} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        onSave={(settings) => {
          console.log('Availability settings saved:', settings);
          fetchPending();
          fetchConfirmed();
        }}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
