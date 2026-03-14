import { useState, useEffect } from 'react';
import {
  X, PawPrint, User, Calendar, Stethoscope, FileText,
  Thermometer, Heart, Wind, Scale, ClipboardList, Pill,
  AlertCircle, Loader,
} from 'lucide-react';
import { apiFetch } from '../utils/api';

export function RecordDetailModal({ isOpen, recordId, onClose }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!isOpen || !recordId) return;
    let cancelled = false;
    const load = async () => {
      setRecord(null);
      setError(null);
      setLoading(true);
      const res = await apiFetch(`medical-record/${recordId}`);
      if (cancelled) return;
      setLoading(false);
      if (res.ok) {
        setRecord(res.data?.data ?? res.data);
      } else {
        setError(res.data?.message || 'Failed to load record.');
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, recordId]);

  if (!isOpen) return null;

  const fmt = (iso) => iso ? new Date(iso).toLocaleString() : '—';
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div className="rdm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rdm-container">
        {/* Header */}
        <div className="rdm-header">
          <div className="rdm-header-left">
            <div className="rdm-header-icon"><FileText size={20} /></div>
            <div>
              <h2 className="rdm-title">Medical Record</h2>
              <p className="rdm-subtitle">Full visit details</p>
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
              {/* Pet + Owner */}
              <div className="rdm-grid-2">
                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <PawPrint size={15} />
                    Patient
                  </div>
                  <div className="rdm-kv-list">
                    <RdmRow label="Name"    value={record.pet?.name} />
                    <RdmRow label="Species" value={record.pet?.species} />
                    <RdmRow label="Breed"   value={record.pet?.breed} />
                  </div>
                </div>

                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <User size={15} />
                    Owner
                  </div>
                  <div className="rdm-kv-list">
                    <RdmRow label="Name"  value={ownerName(record.petOwner)} />
                    <RdmRow label="Phone" value={record.petOwner?.phone} />
                    <RdmRow label="Email" value={record.petOwner?.email} />
                  </div>
                </div>
              </div>

              {/* Visit Info */}
              <div className="rdm-section">
                <div className="rdm-section-title">
                  <Calendar size={15} />
                  Visit Details
                </div>
                <div className="rdm-kv-list rdm-kv-list--row">
                  <RdmRow label="Visit Type" value={record.visitType} />
                  <RdmRow label="Date"       value={fmtDate(record.visitDate || record.createdAt)} />
                  <RdmRow label="Status"     value={record.status} badge />
                </div>
              </div>

              {/* Complaints */}
              {record.presentingComplaints?.length > 0 && (
                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <ClipboardList size={15} />
                    Presenting Complaints
                  </div>
                  <div className="rdm-chip-list">
                    {record.presentingComplaints.map((c, i) => (
                      <span key={i} className="rdm-chip">{c.symptom || c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vitals */}
              {record.vitals && (
                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <Thermometer size={15} />
                    Vitals
                  </div>
                  <div className="rdm-vitals-grid">
                    <VitalCard icon={<Thermometer size={16}/>} label="Temperature" value={record.vitals.temperature} unit="°C" />
                    <VitalCard icon={<Heart size={16}/>}        label="Heart Rate"  value={record.vitals.heartRate}   unit="bpm" />
                    <VitalCard icon={<Wind size={16}/>}         label="Resp. Rate"  value={record.vitals.respiratoryRate} unit="/min" />
                    <VitalCard icon={<Scale size={16}/>}        label="Weight"      value={record.vitals.weightKg}    unit="kg" />
                  </div>
                </div>
              )}

              {/* Diagnosis */}
              {record.diagnosis && (
                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <Stethoscope size={15} />
                    Diagnosis
                  </div>
                  <div className="rdm-kv-list">
                    <RdmRow label="Primary"   value={record.diagnosis.primary} />
                    <RdmRow label="Severity"  value={record.diagnosis.severity} />
                    {record.diagnosis.differentials?.length > 0 && (
                      <RdmRow label="Differentials" value={record.diagnosis.differentials.join(', ')} />
                    )}
                  </div>
                </div>
              )}

              {/* Prescriptions */}
              {record.prescriptions?.length > 0 && (
                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <Pill size={15} />
                    Prescriptions
                  </div>
                  <div className="rdm-pill-table">
                    <div className="rdm-pill-table-head">
                      <span>Medication</span><span>Dose</span><span>Frequency</span><span>Duration</span>
                    </div>
                    {record.prescriptions.map((rx, i) => (
                      <div key={i} className="rdm-pill-table-row">
                        <span>{rx.medicationName || rx.name || '—'}</span>
                        <span>{rx.dosage || '—'}</span>
                        <span>{rx.frequency || '—'}</span>
                        <span>{rx.duration || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {(record.generalNotes || record.soapNotes?.subjective) && (
                <div className="rdm-section">
                  <div className="rdm-section-title">
                    <FileText size={15} />
                    Notes
                  </div>
                  {record.soapNotes?.subjective && (
                    <div className="rdm-notes-block">
                      <span className="rdm-notes-label">SOAP — Subjective</span>
                      <p>{record.soapNotes.subjective}</p>
                    </div>
                  )}
                  {record.generalNotes && (
                    <div className="rdm-notes-block">
                      <span className="rdm-notes-label">General Notes</span>
                      <p>{record.generalNotes}</p>
                    </div>
                  )}
                </div>
              )}

              <p className="rdm-meta">Created: {fmt(record.createdAt)}</p>
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

// ── Helpers ──────────────────────────────────────────────────
function ownerName(owner) {
  if (!owner) return '—';
  if (typeof owner === 'string') return owner;
  return `${owner.firstname || ''} ${owner.lastname || ''}`.trim() || '—';
}

function RdmRow({ label, value, badge }) {
  if (!value && value !== 0) return null;
  return (
    <div className="rdm-kv">
      <span className="rdm-kv-label">{label}</span>
      {badge
        ? <span className={`status-badge status-${(value || '').toLowerCase()}`}>{value}</span>
        : <span className="rdm-kv-value">{value}</span>
      }
    </div>
  );
}

function VitalCard({ icon, label, value, unit }) {
  if (!value && value !== 0) return null;
  return (
    <div className="rdm-vital-card">
      <div className="rdm-vital-icon">{icon}</div>
      <div>
        <p className="rdm-vital-label">{label}</p>
        <p className="rdm-vital-value">{value} <span className="rdm-vital-unit">{unit}</span></p>
      </div>
    </div>
  );
}
