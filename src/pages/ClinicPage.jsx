import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, MapPin, Phone, Mail, Users, Clock,
  CheckCircle, XCircle, AlertCircle, Loader, Edit2,
  Save, X, UserCheck, UserX, RefreshCw,
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/useAuth';
import { ToastContainer } from '../components/Toast.jsx';
import { useToast } from '../components/useToast.js';
import '../assets/styles/clinic.css';

/* ── helpers ── */
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function Avatar({ name, size = 'md' }) {
  const parts = (name || 'U').split(' ').filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
  return <div className={`clinic-avatar clinic-avatar--${size}`}>{initials}</div>;
}


export function ClinicPage() {
  const { user } = useAuth();
  const { toasts, toast, removeToast } = useToast();

  const [clinic, setClinic]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // join requests
  const [requests, setRequests]   = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);

  // edit mode
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({ name: '', address: '', phone: '', email: '' });
  const [saving, setSaving]       = useState(false);

  // active tab
  const [tab, setTab]             = useState('overview'); // 'overview' | 'staff' | 'requests'

  /* ── derive clinic ID from user profile ── */
  const clinicId = user?.veterinarianData?.clinic?.id
    || user?.veterinarianData?.clinic
    || null;

  const isOwner = clinic
    ? (clinic.owner?.id || clinic.owner) === (user?.id || user?.id)
    : false;

  /* ── fetch clinic detail ── */
  const loadClinic = useCallback(async () => {
    if (!clinicId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    
    const res = await apiFetch(`clinics/${clinicId}`);
    setLoading(false);
    if (res.ok) {
      const data = res.data?.clinic ?? res.data;
      setClinic(data);
      setEditForm({
        name:    data.name    || '',
        address: data.address || '',
        phone:   data.phone   || '',
        email:   data.email   || '',
      });
    } else {
      setError(res.data?.message || 'Could not load clinic details.');
    }
  }, [clinicId]);

  /* ── fetch join requests ── */
  const loadRequests = useCallback(async () => {
    if (!clinicId) return;
    setLoadingReqs(true);
    // GET /api/v1/clinics/:clinicId/requests
    const res = await apiFetch(`clinics/${clinicId}/requests`);
    setLoadingReqs(false);
    if (res.ok) {
      setRequests(res.data?.requests ?? res.data ?? []);
    } else {
      toast.error(res.data?.message || 'Could not load join requests.');
    }
  }, [clinicId, toast]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => { if (!cancelled) await loadClinic(); };
    run();
    return () => { cancelled = true; };
  }, [loadClinic]);

  useEffect(() => {
    if (tab !== 'requests') return;
    let cancelled = false;
    const run = async () => { if (!cancelled) await loadRequests(); };
    run();
    return () => { cancelled = true; };
  }, [tab, loadRequests]);

  /* ── approve / decline handlers ── */
  const handleApprove = async (requestId) => {
    // POST /api/v1/clinics/:clinicId/requests/:requestId/approve
    const res = await apiFetch(`clinics/${clinicId}/requests/${requestId}/approve`, { method: 'POST' });
    if (res.ok) {
      toast.success('Request approved — staff member added.');
      loadRequests();
      loadClinic();
    } else {
      toast.error(res.data?.message || 'Could not approve request.');
    }
  };

  const handleDecline = async (requestId) => {
    // POST /api/v1/clinics/:clinicId/requests/:requestId/decline
    const res = await apiFetch(`clinics/${clinicId}/requests/${requestId}/decline`, { method: 'POST' });
    if (res.ok) {
      toast.info('Request declined.');
      loadRequests();
    } else {
      toast.error(res.data?.message || 'Could not decline request.');
    }
  };

  /* ── save clinic details ── */
  const handleSave = async () => {
    setSaving(true);
    // PUT /api/v1/clinics/:clinicId  (owner only)
    const res = await apiFetch(`clinics/${clinicId}`, {
      method: 'PUT',
      body: editForm,
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Clinic details updated.');
      const updated = res.data?.clinic ?? res.data ?? editForm;
      setClinic(prev => ({ ...prev, ...updated }));
      setEditing(false);
    } else {
      toast.error(res.data?.message || 'Could not save changes.');
    }
  };

  /* ── pending count badge ── */
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  /* ====================================================
     RENDER STATES
     ==================================================== */
  if (loading) {
    return (
      <div className="clinic-page">
        <div className="clinic-empty-state">
          <Loader size={32} className="clinic-spinner" />
          <p>Loading clinic information…</p>
        </div>
      </div>
    );
  }

  if (!clinicId || !clinic) {
    return (
      <div className="clinic-page">
        <div className="clinic-page-header">
          <h1 className="clinic-page-title">Clinic Management</h1>
          <p className="clinic-page-subtitle">Manage your veterinary clinic.</p>
        </div>
        <div className="clinic-empty-state clinic-empty-state--card">
          <Building2 size={40} className="clinic-empty-icon" />
          <h2 className="clinic-empty-title">No clinic linked</h2>
          <p className="clinic-empty-desc">
            Your account is not linked to a clinic yet. Ask your clinic administrator to
            send you an invite, or register a new clinic from the admin panel.
          </p>
          {error && (
            <div className="clinic-inline-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  /* ====================================================
     MAIN VIEW
     ==================================================== */
  return (
    <div className="clinic-page">
      {/* Page Header */}
      <div className="clinic-page-header">
        <div>
          <h1 className="clinic-page-title">Clinic Management</h1>
          <p className="clinic-page-subtitle">Manage your clinic details, staff and join requests.</p>
        </div>
        <div className="clinic-header-actions">
          {isOwner && !editing && (
            <button className="clinic-btn clinic-btn--outline" onClick={() => setEditing(true)}>
              <Edit2 size={15} /> Edit Details
            </button>
          )}
          <button className="clinic-btn clinic-btn--ghost" onClick={() => { loadClinic(); loadRequests(); }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="clinic-tabs">
        <button
          className={`clinic-tab${tab === 'overview' ? ' clinic-tab--active' : ''}`}
          onClick={() => setTab('overview')}
        >
          <Building2 size={15} /> Overview
        </button>
        <button
          className={`clinic-tab${tab === 'staff' ? ' clinic-tab--active' : ''}`}
          onClick={() => setTab('staff')}
        >
          <Users size={15} /> Staff ({(clinic.staff || []).length})
        </button>
        {isOwner && (
          <button
            className={`clinic-tab${tab === 'requests' ? ' clinic-tab--active' : ''}`}
            onClick={() => setTab('requests')}
          >
            <UserCheck size={15} />
            Join Requests
            {pendingCount > 0 && (
              <span className="clinic-tab-badge">{pendingCount}</span>
            )}
          </button>
        )}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'overview' && (
        <div className="clinic-overview">
          {/* Info Card */}
          <div className="clinic-card">
            <div className="clinic-card-header">
              <div className="clinic-card-icon">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="clinic-card-title">{clinic.name}</h2>
                <p className="clinic-card-subtitle">Clinic Details</p>
              </div>
            </div>

            {editing ? (
              <div className="clinic-edit-form">
                <div className="clinic-form-grid">
                  <div className="clinic-form-group">
                    <label className="clinic-label">Clinic Name</label>
                    <input
                      className="clinic-input"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Clinic name"
                    />
                  </div>
                  <div className="clinic-form-group">
                    <label className="clinic-label">Phone</label>
                    <input
                      className="clinic-input"
                      value={editForm.phone}
                      onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+94 77 000 0000"
                    />
                  </div>
                  <div className="clinic-form-group">
                    <label className="clinic-label">Email</label>
                    <input
                      className="clinic-input"
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="contact@clinic.com"
                    />
                  </div>
                  <div className="clinic-form-group clinic-form-group--full">
                    <label className="clinic-label">Address</label>
                    <input
                      className="clinic-input"
                      value={editForm.address}
                      onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="123 Main St, City"
                    />
                  </div>
                </div>
                <div className="clinic-edit-actions">
                  <button
                    className="clinic-btn clinic-btn--ghost"
                    onClick={() => { setEditing(false); setEditForm({ name: clinic.name || '', address: clinic.address || '', phone: clinic.phone || '', email: clinic.email || '' }); }}
                    disabled={saving}
                  >
                    <X size={15} /> Cancel
                  </button>
                  <button className="clinic-btn clinic-btn--primary" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader size={15} className="clinic-spinner" /> : <Save size={15} />}
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="clinic-info-grid">
                <InfoRow icon={<MapPin size={16} />}  label="Address" value={clinic.address || 'Not set'} />
                <InfoRow icon={<Phone size={16} />}   label="Phone"   value={clinic.phone   || 'Not set'} />
                <InfoRow icon={<Mail size={16} />}    label="Email"   value={clinic.email   || 'Not set'} />
                <InfoRow icon={<Users size={16} />}   label="Staff"   value={`${(clinic.staff || []).length} member${(clinic.staff || []).length !== 1 ? 's' : ''}`} />
                <InfoRow icon={<Clock size={16} />}   label="Since"   value={fmtDate(clinic.createdAt)} />
              </div>
            )}
          </div>

          {/* Map / Location Card */}
          {(clinic.location?.coordinates || clinic.address) && (
            <div className="clinic-card clinic-card--map">
              <div className="clinic-card-section-title">
                <MapPin size={15} /> Location
              </div>
              {clinic.location?.coordinates ? (
                <div className="clinic-map-frame">
                  <iframe
                    title="Clinic Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '0.5rem' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${clinic.location.coordinates[1]},${clinic.location.coordinates[0]}&z=15&output=embed`}
                  />
                </div>
              ) : (
                <div className="clinic-map-placeholder">
                  <MapPin size={28} className="clinic-empty-icon" />
                  <p>{clinic.address}</p>
                  <p className="clinic-map-hint">No coordinates stored — map unavailable.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Staff Tab ── */}
      {tab === 'staff' && (
        <div className="clinic-card">
          <div className="clinic-card-section-title">
            <Users size={15} /> Staff Members
          </div>
          {!clinic.staff || clinic.staff.length === 0 ? (
            <div className="clinic-empty-state clinic-empty-state--inline">
              <Users size={28} className="clinic-empty-icon" />
              <p>No staff members yet.</p>
            </div>
          ) : (
            <div className="clinic-staff-list">
              {clinic.staff.map((member, idx) => {
                const m = typeof member === 'object' ? member : { _id: member };
                const name = m.firstname || m.name
                  ? `${m.firstname || ''} ${m.lastname || ''}`.trim()
                  : `Member #${idx + 1}`;
                const isClinicOwner = (clinic.owner?._id || clinic.owner) === (m._id || m);
                return (
                  <div key={m._id || idx} className="clinic-staff-row">
                    <Avatar name={name} />
                    <div className="clinic-staff-info">
                      <p className="clinic-staff-name">{name}</p>
                      {m.email && <p className="clinic-staff-meta">{m.email}</p>}
                    </div>
                    {isClinicOwner && (
                      <span className="clinic-role-badge clinic-role-badge--owner">Owner</span>
                    )}
                    {!isClinicOwner && (
                      <span className="clinic-role-badge clinic-role-badge--staff">Staff</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Join Requests Tab ── */}
      {tab === 'requests' && isOwner && (
        <div className="clinic-card">
          <div className="clinic-card-section-title">
            <UserCheck size={15} /> Join Requests
          </div>
          {loadingReqs ? (
            <div className="clinic-empty-state clinic-empty-state--inline">
              <Loader size={24} className="clinic-spinner" />
              <p>Loading requests…</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="clinic-empty-state clinic-empty-state--inline">
              <CheckCircle size={28} className="clinic-empty-icon" />
              <p>No join requests at this time.</p>
            </div>
          ) : (
            <div className="clinic-requests-list">
              {/* Pending first */}
              {['PENDING', 'APPROVED', 'DECLINED'].map(status => {
                const group = requests.filter(r => r.status === status);
                if (group.length === 0) return null;
                return (
                  <div key={status} className="clinic-request-group">
                    <p className="clinic-request-group-label">{status.charAt(0) + status.slice(1).toLowerCase()}</p>
                    {group.map(req => {
                      const u = req.user || {};
                      const name = u.firstname
                        ? `${u.firstname} ${u.lastname || ''}`.trim()
                        : 'Unknown User';
                      return (
                        <div key={req._id} className={`clinic-request-row clinic-request-row--${status.toLowerCase()}`}>
                          <Avatar name={name} size="sm" />
                          <div className="clinic-request-info">
                            <p className="clinic-request-name">{name}</p>
                            {u.email && <p className="clinic-request-meta">{u.email}</p>}
                            {req.message && (
                              <p className="clinic-request-msg">"{req.message}"</p>
                            )}
                          </div>
                          <div className="clinic-request-status">
                            {status === 'PENDING' && (
                              <>
                                <button
                                  className="clinic-btn clinic-btn--approve"
                                  onClick={() => handleApprove(req._id)}
                                >
                                  <UserCheck size={14} /> Approve
                                </button>
                                <button
                                  className="clinic-btn clinic-btn--decline"
                                  onClick={() => handleDecline(req._id)}
                                >
                                  <UserX size={14} /> Decline
                                </button>
                              </>
                            )}
                            {status === 'APPROVED' && (
                              <span className="clinic-status-chip clinic-status-chip--approved">
                                <CheckCircle size={13} /> Approved
                              </span>
                            )}
                            {status === 'DECLINED' && (
                              <span className="clinic-status-chip clinic-status-chip--declined">
                                <XCircle size={13} /> Declined
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

/* ── small helper component ── */
function InfoRow({ icon, label, value }) {
  return (
    <div className="clinic-info-row">
      <span className="clinic-info-icon">{icon}</span>
      <span className="clinic-info-label">{label}</span>
      <span className="clinic-info-value">{value}</span>
    </div>
  );
}

export default ClinicPage;
