import { useState, useEffect } from 'react';
import {
  X, PawPrint, User, Calendar, ShieldCheck, Syringe,
  AlertCircle, Loader, Clock,
} from 'lucide-react';
import { apiFetch } from '../utils/api';

export function VaccinationDetailModal({ isOpen, vaccinationId, onClose }) {
  const [record, setRecord]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!isOpen || !vaccinationId) return;
    let cancelled = false;
    const load = async () => {
      setRecord(null);
      setError(null);
      setLoading(true);
      const res = await apiFetch(`vaccination/${vaccinationId}`);
      if (cancelled) return;
      setLoading(false);
      if (res.ok) {
        setRecord(res.data?.data ?? res.data);
      } else {
        setError(res.data?.message || 'Failed to load vaccination record.');
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, vaccinationId]);

  if (!isOpen) return null;

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })
      : '—';

  return (
    <div className="rdm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rdm-container rdm-container--narrow">
        {/* Header */}
        <div className="rdm-header rdm-header--info">
          <div className="rdm-header-left">
            <div className="rdm-header-icon rdm-header-icon--info"><Syringe size={20} /></div>
            <div>
              <h2 className="rdm-title">Vaccination Record</h2>
              <p className="rdm-subtitle">Immunisation details</p>
            </div>
          </div>
          <button className="rdm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="rdm-body">
          {loading && (
            <div className="rdm-state">
              <Loader size={28} className="rdm-spinner" />
              <p>Loading record…</p>
            </div>
          )}

          {error && !loading && (
            <div className="rdm-state rdm-state--error">
              <AlertCircle size={28} />
              <p>{error}</p>
            </div>
          )}

          {record && !loading && (
            <>
              {/* Status Banner */}
              <div className={`vdm-status-banner vdm-status-banner--${(record.status || '').toLowerCase()}`}>
                <ShieldCheck size={18} />
                <span>{record.status || 'Unknown'}</span>
              </div>

              {/* Pet + Vaccine side by side */}
              <div className="rdm-grid-2">
                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <PawPrint size={15} />
                    Patient
                  </div>
                  <div className="rdm-kv-list">
                    <VdmRow label="Name"    value={record.pet?.name} />
                    <VdmRow label="Species" value={record.pet?.species} />
                    <VdmRow label="Breed"   value={record.pet?.breed} />
                  </div>
                </div>

                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <Syringe size={15} />
                    Vaccine
                  </div>
                  <div className="rdm-kv-list">
                    <VdmRow label="Name"         value={record.vaccineName} />
                    <VdmRow label="Dose"         value={record.dose} />
                    <VdmRow label="Route"        value={record.route} />
                    <VdmRow label="Manufacturer" value={record.manufacturer} />
                    <VdmRow label="Batch No."    value={record.batchNumber} />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="rdm-section">
                <div className="rdm-section-title">
                  <Calendar size={15} />
                  Schedule
                </div>
                <div className="vdm-schedule-cards">
                  <div className="vdm-schedule-card vdm-schedule-card--given">
                    <div className="vdm-schedule-icon"><Clock size={16}/></div>
                    <div>
                      <p className="vdm-schedule-label">Administered</p>
                      <p className="vdm-schedule-date">{fmtDate(record.administeredDate)}</p>
                    </div>
                  </div>
                  {record.nextDueDate && (
                    <div className="vdm-schedule-card vdm-schedule-card--next">
                      <div className="vdm-schedule-icon"><ShieldCheck size={16}/></div>
                      <div>
                        <p className="vdm-schedule-label">Next Due</p>
                        <p className="vdm-schedule-date">{fmtDate(record.nextDueDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {record.notes && (
                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <User size={15} />
                    Notes
                  </div>
                  <div className="rdm-notes-block">
                    <p>{record.notes}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="rdm-footer">
          <button className="rdm-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function VdmRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="rdm-kv">
      <span className="rdm-kv-label">{label}</span>
      <span className="rdm-kv-value">{value}</span>
    </div>
  );
}
