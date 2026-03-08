import { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, Phone, Settings, Check, X,
  AlertCircle, CheckCircle, PawPrint, ClipboardList,
  Ban, UserX, ChevronDown,
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

  // ── Status update modal ────────────────────────────────────
  const [statusModal, setStatusModal] = useState(null); // { apt } | null
  const [selectedStatus, setSelectedStatus] = useState('');
  const [vetNote, setVetNote]               = useState('');
  const [savingStatus, setSavingStatus]     = useState(false);

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

  // ── Status Update ──────────────────────────────────────────
  const openStatusModal = (apt) => {
    setStatusModal(apt);
    setSelectedStatus('');
    setVetNote('');
  };

  const closeStatusModal = () => {
    setStatusModal(null);
    setSelectedStatus('');
    setVetNote('');
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !statusModal) return;
    setSavingStatus(true);
    const res = await apiFetch(`appointments/${statusModal._id || statusModal.id}/status`, {
      method: 'PATCH',
      body: { status: selectedStatus, ...(vetNote.trim() ? { vetNote: vetNote.trim() } : {}) },
    });
    setSavingStatus(false);
    if (res.ok) {
      const labels = { COMPLETED: 'completed', CANCELLED: 'cancelled', NO_SHOW: 'marked as no-show' };
      toast.success(`Appointment ${labels[selectedStatus] || 'updated'}.`);
      closeStatusModal();
      await Promise.all([fetchPending(), fetchConfirmed()]);
    } else {
      toast.error(res.data?.message || 'Failed to update appointment status.');
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

  /* ── Status option config ── */
  const STATUS_OPTIONS = [
    { value: 'COMPLETED', label: 'Completed',  icon: CheckCircle, cls: 'status-opt--completed' },
    { value: 'CANCELLED', label: 'Cancelled',  icon: Ban,         cls: 'status-opt--cancelled' },
    { value: 'NO_SHOW',   label: 'No Show',    icon: UserX,       cls: 'status-opt--noshow'    },
  ];

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
            onClick={() => handleConfirm(apt._id || apt.id)}
          >
            <Check size={14} />
            Accept
          </button>
          <button
            className="appt-btn appt-btn--decline"
            onClick={() => handleDecline(apt._id || apt.id)}
          >
            <X size={14} />
            Decline
          </button>
        </div>
      )}

      {!isPending && (
        <div className="appt-card__actions">
          <button
            className="appt-btn appt-btn--status"
            onClick={() => openStatusModal(apt)}
          >
            <ClipboardList size={14} />
            Update Status
            <ChevronDown size={13} />
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

      {/* ── Status Update Modal ── */}
      {statusModal && (
        <div className="appt-status-overlay" onClick={closeStatusModal}>
          <div className="appt-status-modal" onClick={e => e.stopPropagation()}>
            <div className="appt-status-modal__header">
              <div>
                <h2 className="appt-status-modal__title">Update Appointment Status</h2>
                <p className="appt-status-modal__sub">
                  {statusModal.pet?.name || 'Patient'} &mdash; {fmtDate(statusModal.startTime)} at {fmtTime(statusModal.startTime)}
                </p>
              </div>
              <button className="appt-status-modal__close" onClick={closeStatusModal}>
                <X size={18} />
              </button>
            </div>

            <div className="appt-status-modal__body">
              <p className="appt-status-modal__label">Select outcome</p>
              <div className="appt-status-opts">
                {STATUS_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      className={`appt-status-opt ${opt.cls}${selectedStatus === opt.value ? ' appt-status-opt--active' : ''}`}
                      onClick={() => setSelectedStatus(opt.value)}
                    >
                      <Icon size={18} />
                      <span>{opt.label}</span>
                      {selectedStatus === opt.value && <Check size={14} className="appt-status-opt__check" />}
                    </button>
                  );
                })}
              </div>

              <div className="appt-status-modal__note">
                <label className="appt-status-modal__label" htmlFor="vetNote">
                  Vet note <span className="appt-status-modal__optional">(optional)</span>
                </label>
                <textarea
                  id="vetNote"
                  className="appt-status-modal__textarea"
                  rows={3}
                  placeholder="Add any notes for this appointment…"
                  value={vetNote}
                  onChange={e => setVetNote(e.target.value)}
                />
              </div>
            </div>

            <div className="appt-status-modal__footer">
              <button className="appt-btn appt-btn--ghost" onClick={closeStatusModal} disabled={savingStatus}>
                Cancel
              </button>
              <button
                className="appt-btn appt-btn--primary"
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || savingStatus}
              >
                {savingStatus ? 'Saving…' : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
