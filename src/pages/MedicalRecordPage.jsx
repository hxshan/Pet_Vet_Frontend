import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Plus, FileText, Calendar, Syringe, AlertCircle, ChevronDown, ChevronUp, QrCode } from 'lucide-react';
import '../assets/styles/medicalRecords.css';
import NewRecordModal from '../components/NewRecordModal';
import { VaccinationModal } from '../components/VaccinationModal';
import { RecordDetailModal } from '../components/RecordDetailModal';
import { VaccinationDetailModal } from '../components/VaccinationDetailModal';
import { ToastContainer } from '../components/Toast.jsx';
import { useToast } from '../components/useToast.js';
import { apiFetch } from '../utils/api';

function MedicalRecords() {
  const [activeTab, setActiveTab] = useState('medical');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);

  // Medical records state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Vaccination records state
  const [vaxRecords, setVaxRecords] = useState([]);
  const [loadingVax, setLoadingVax] = useState(false);
  const [errorVax, setErrorVax] = useState('');
  const [vaxPage, setVaxPage] = useState(1);
  const [vaxTotal, setVaxTotal] = useState(0);
  const [vaxRefreshKey, setVaxRefreshKey] = useState(0);

  // Detail modal state
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedVaxId, setSelectedVaxId] = useState(null);

  // Pet-by-QR tab state — identical scan flow to NewRecordModal
  const [scannedPet, setScannedPet] = useState(null);
  const [petHealth, setPetHealth] = useState(null);
  const [petHealthLoading, setPetHealthLoading] = useState(false);
  const [petHealthError, setPetHealthError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scanError, setScanError] = useState('');
  // client-side pagination for health sections
  const [vaxActivePage, setVaxActivePage] = useState(1);
  const [vaxOverduePage, setVaxOverduePage] = useState(1);
  const [medPage, setMedPage] = useState(1);
  const [expandedMed, setExpandedMed] = useState(null);
  const HEALTH_PAGE_SIZE = 5;
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanAnimationRef = useRef(null);

  const stopScan = async (stream) => {
    setIsCameraOpen(false);
    if (scanAnimationRef.current) {
      cancelAnimationFrame(scanAnimationRef.current);
      scanAnimationRef.current = null;
    }
    if (videoRef.current) {
      const s = videoRef.current.srcObject || stream;
      if (s && s.getTracks) s.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const fetchPetByToken = async (token) => {
    setScanError('');
    // extract raw UUID if the QR encodes a full URL
    const uuidMatch = token.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    const rawToken = uuidMatch ? uuidMatch[0] : token;
    try {
      const { ok, status, data } = await apiFetch(`pet/token/${rawToken}`);
      if (!ok) {
        setScanError((data && data.message) || `Pet not found (${status})`);
        return;
      }
      setScannedPet(data.data);
      // fetch full health history
      setPetHealthLoading(true);
      setPetHealthError('');
      setPetHealth(null);
      setVaxActivePage(1);
      setVaxOverduePage(1);
      setMedPage(1);
      setExpandedMed(null);
      try {
        const hr = await apiFetch(`pet/token/${rawToken}/health`);
        if (hr.ok) {
          setPetHealth(hr.data);
        } else {
          setPetHealthError((hr.data && hr.data.message) || 'Failed to load health history');
        }
      } catch (he) {
        console.error('health fetch error', he);
        setPetHealthError('Network error while loading health history');
      } finally {
        setPetHealthLoading(false);
      }
    } catch (err) {
      console.error('fetchPetByToken error', err);
      setScanError('Network error while fetching pet');
    }
  };

  const startScan = async () => {
    setScanError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanError('Camera API not supported in this browser');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const hasBarcodeDetector = typeof window.BarcodeDetector !== 'undefined';
      const detector = hasBarcodeDetector ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null;
      let jsQR = null;
      if (!detector) {
        try {
          const mod = await import('jsqr');
          jsQR = mod.default || mod;
        } catch (err) {
          console.warn('jsQR not available', err);
          jsQR = null;
        }
      }
      const scanLoop = async () => {
        try {
          if (detector && videoRef.current) {
            const results = await detector.detect(videoRef.current);
            if (results && results.length > 0) {
              const token = results[0].rawValue;
              await stopScan(stream);
              fetchPetByToken(token);
              return;
            }
          } else if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            const w = videoRef.current.videoWidth || 640;
            const h = videoRef.current.videoHeight || 480;
            canvasRef.current.width = w;
            canvasRef.current.height = h;
            ctx.drawImage(videoRef.current, 0, 0, w, h);
            if (jsQR) {
              const imageData = ctx.getImageData(0, 0, w, h);
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              if (code && code.data) {
                const token = code.data;
                await stopScan(stream);
                fetchPetByToken(token);
                return;
              }
            } else {
              setScanError('QR scanning not supported in this browser');
              await stopScan(stream);
              return;
            }
          }
        } catch (e) {
          console.error('Scan error', e);
          setScanError('Error while scanning');
          await stopScan(stream);
          return;
        }
        scanAnimationRef.current = requestAnimationFrame(scanLoop);
      };
      setIsCameraOpen(true);
      scanAnimationRef.current = requestAnimationFrame(scanLoop);
    } catch (err) {
      console.error('Camera error', err);
      setScanError('Could not access camera');
    }
  };

  const { toasts, toast, removeToast } = useToast();

  const triggerRefresh = () => setRefreshKey(k => k + 1);
  const triggerVaxRefresh = () => setVaxRefreshKey(k => k + 1);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const qParam = query ? `&q=${encodeURIComponent(query)}` : '';
        const res = await apiFetch(`medical-record/vet?page=${page}&limit=${limit}${qParam}`);
        if (!mounted) return;
        if (res.ok && res.data && Array.isArray(res.data.data)) {
          setRecords(res.data.data);
          setTotal(res.data.total || 0);
        } else {
          setRecords([]);
          setTotal(0);
          setError('No records found');
        }
      } catch (err) {
        console.error('Failed to load medical records', err);
        if (mounted) setError('Failed to load records');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [page, limit, query, refreshKey]);

  useEffect(() => {
    if (activeTab !== 'vaccination') return;
    let mounted = true;
    const load = async () => {
      setLoadingVax(true);
      setErrorVax('');
      try {
        const res = await apiFetch(`vaccination/vet?page=${vaxPage}&limit=${limit}`);
        if (!mounted) return;
        if (res.ok && res.data) {
          const rows = res.data.data ?? res.data;
          setVaxRecords(Array.isArray(rows) ? rows : []);
          setVaxTotal(res.data.count ?? res.data.total ?? 0);
        } else {
          setVaxRecords([]);
          setVaxTotal(0);
          setErrorVax('No vaccination records found');
        }
      } catch (err) {
        console.error('Failed to load vaccination records', err);
        if (mounted) setErrorVax('Failed to load vaccination records');
      } finally {
        if (mounted) setLoadingVax(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [activeTab, vaxPage, limit, vaxRefreshKey]);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  return (
    <div className="medical-records-container">
      <div className="records-header">
        <h1 className="records-title">Medical Records</h1>
        <p className="records-subtitle">Manage and view patient medical records.</p>
      </div>

      {/* Tab Switcher */}
      <div className="records-tabs">
        <button
          className={`records-tab${activeTab === 'medical' ? ' records-tab--active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          <FileText size={16} />
          Medical Records
        </button>
        <button
          className={`records-tab${activeTab === 'vaccination' ? ' records-tab--active' : ''}`}
          onClick={() => setActiveTab('vaccination')}
        >
          <Syringe size={16} />
          Vaccination Records
        </button>
        <button
          className={`records-tab${activeTab === 'petqr' ? ' records-tab--active' : ''}`}
          onClick={() => { setActiveTab('petqr'); stopScan(); setScannedPet(null); setPetHealth(null); setPetHealthError(''); setIsCameraOpen(false); setScanError(''); }}
        >
          <QrCode size={16} />
          Pet by QR
        </button>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        {activeTab === 'medical' && (
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search patients by name, owner, or species..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        <button className="filter-button">
          <Filter className="button-icon" />
          Filter
        </button>
        {activeTab !== 'petqr' && (
          <>
            <button className="new-record-button" onClick={() => setIsModalOpen(true)}>
              <Plus className="button-icon" />
              New Record
            </button>
            <button className="new-record-button" onClick={() => setIsVaccinationModalOpen(true)}>
              <Plus className="button-icon" />
              New Vaccination
            </button>
          </>
        )}
      </div>

      {/* ── Medical Records Table ── */}
      {activeTab === 'medical' && (
        <>
          <div className="table-container">
            <div className="table-wrapper">
              <table className="records-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-heading">Patient Name</th>
                    <th className="table-heading">Species</th>
                    <th className="table-heading">Breed</th>
                    <th className="table-heading">Owner</th>
                    <th className="table-heading">Last Visit</th>
                    <th className="table-heading">Status</th>
                    <th className="table-heading">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {loading ? (
                    <tr className="table-row"><td colSpan={7} className="table-cell">Loading...</td></tr>
                  ) : error ? (
                    <tr className="table-row"><td colSpan={7} className="table-cell">{error}</td></tr>
                  ) : records.length === 0 ? (
                    <tr className="table-row"><td colSpan={7} className="table-cell">No records</td></tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record._id} className="table-row">
                        <td className="table-cell cell-primary">{record.pet?.name || '—'}</td>
                        <td className="table-cell">{record.pet?.species || '—'}</td>
                        <td className="table-cell">{record.pet?.breed || '—'}</td>
                        <td className="table-cell">{(record.petOwner && (record.petOwner.firstname || record.petOwner.lastname)) ? `${record.petOwner.firstname || ''} ${record.petOwner.lastname || ''}`.trim() : (typeof record.petOwner === 'string' ? record.petOwner : '—')}</td>
                        <td className="table-cell">
                          <div className="date-cell">
                            <Calendar className="date-icon" />
                            {record.visitDate ? new Date(record.visitDate).toLocaleString() : (record.createdAt ? new Date(record.createdAt).toLocaleString() : '—')}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="status-badge status-active">
                            {record.status || 'Active'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button className="view-button" onClick={() => setSelectedRecordId(record._id)}>
                            <FileText className="view-icon" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pagination-container">
            <p className="pagination-info">
              Showing {records.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records
            </p>
            <div className="pagination-buttons">
              <button className="pagination-button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
              {Array.from({ length: Math.max(1, Math.ceil(total / limit)) }).slice(Math.max(0, page - 3), page + 2).map((_, idx) => {
                const pnum = idx + Math.max(1, page - 3);
                return (
                  <button key={pnum} className={`pagination-button ${pnum === page ? 'pagination-active' : ''}`} onClick={() => setPage(pnum)}>{pnum}</button>
                );
              })}
              <button className="pagination-button" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>Next</button>
            </div>
          </div>
        </>
      )}

      {/* ── Vaccination Records Table ── */}
      {activeTab === 'vaccination' && (
        <>
          <div className="table-container">
            <div className="table-wrapper">
              <table className="records-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-heading">Pet Name</th>
                    <th className="table-heading">Species</th>
                    <th className="table-heading">Vaccine</th>
                    <th className="table-heading">Dose</th>
                    <th className="table-heading">Administered</th>
                    <th className="table-heading">Next Due</th>
                    <th className="table-heading">Status</th>
                    <th className="table-heading">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {loadingVax ? (
                    <tr className="table-row"><td colSpan={8} className="table-cell">Loading...</td></tr>
                  ) : errorVax ? (
                    <tr className="table-row"><td colSpan={8} className="table-cell">{errorVax}</td></tr>
                  ) : vaxRecords.length === 0 ? (
                    <tr className="table-row"><td colSpan={8} className="table-cell">No vaccination records</td></tr>
                  ) : (
                    vaxRecords.map((vax) => (
                      <tr key={vax._id} className="table-row">
                        <td className="table-cell cell-primary">{vax.pet?.name || '—'}</td>
                        <td className="table-cell">{vax.pet?.species || '—'}</td>
                        <td className="table-cell">{vax.vaccineName || '—'}</td>
                        <td className="table-cell">{vax.dose || '—'}</td>
                        <td className="table-cell">
                          <div className="date-cell">
                            <Calendar className="date-icon" />
                            {vax.administeredDate ? new Date(vax.administeredDate).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="table-cell">
                          {vax.nextDueDate ? new Date(vax.nextDueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="table-cell">
                          <span className={`status-badge ${vaxStatusClass(vax.status)}`}>
                            {vax.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button className="view-button" onClick={() => setSelectedVaxId(vax._id)}>
                            <Syringe className="view-icon" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="pagination-container">
            <p className="pagination-info">
              Showing {vaxRecords.length === 0 ? 0 : (vaxPage - 1) * limit + 1} to {Math.min(vaxPage * limit, vaxTotal)} of {vaxTotal} records
            </p>
            <div className="pagination-buttons">
              <button className="pagination-button" onClick={() => setVaxPage(p => Math.max(1, p - 1))} disabled={vaxPage <= 1}>Previous</button>
              {Array.from({ length: Math.max(1, Math.ceil(vaxTotal / limit)) }).slice(Math.max(0, vaxPage - 3), vaxPage + 2).map((_, idx) => {
                const pnum = idx + Math.max(1, vaxPage - 3);
                return (
                  <button key={pnum} className={`pagination-button ${pnum === vaxPage ? 'pagination-active' : ''}`} onClick={() => setVaxPage(pnum)}>{pnum}</button>
                );
              })}
              <button className="pagination-button" onClick={() => setVaxPage(p => p + 1)} disabled={vaxPage >= Math.ceil(vaxTotal / limit)}>Next</button>
            </div>
          </div>
        </>
      )}

      {/* ── Pet by QR tab ── */}
      {activeTab === 'petqr' && (
        <div className="ph-page">

          {/* Scanner card */}
          <div className="ph-scan-card">
            <div className="ph-scan-card-header">
              <QrCode size={20} />
              <span>Scan Pet QR Code</span>
            </div>

            {/* Camera — always in DOM so ref is ready; shown only while scanning */}
            <div className="ph-camera-wrap" style={{ display: isCameraOpen ? undefined : 'none' }}>
              <video ref={videoRef} className="ph-camera-video" playsInline muted />
              <div className="ph-camera-overlay"><div className="ph-camera-corners" /></div>
              <button className="ph-cancel-scan-btn" onClick={() => stopScan()}>Cancel</button>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!isCameraOpen && !scannedPet && (
              <div className="ph-scan-idle">
                <div className="ph-scan-idle-icon"><QrCode size={56} /></div>
                <p className="ph-scan-idle-text">
                  Point the camera at the pet's QR code to load their full health history
                </p>
                <button className="ph-scan-btn" onClick={startScan}>
                  <QrCode size={18} /> Open Camera
                </button>
              </div>
            )}

            {!isCameraOpen && scannedPet && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="ph-scan-btn" onClick={() => {
                  setScannedPet(null); setPetHealth(null); setPetHealthError('');
                  setVaxActivePage(1); setVaxOverduePage(1); setMedPage(1); setExpandedMed(null);
                  setScanError('');
                }}>
                  <QrCode size={16} /> Scan Another
                </button>
              </div>
            )}

            {scanError && (
              <p className="ph-inline-error"><AlertCircle size={14} /> {scanError}</p>
            )}
          </div>

          {/* Pet banner + action buttons */}
          {scannedPet && (
            <div className="ph-pet-banner">
              <div className="ph-pet-avatar">
                {(scannedPet.species || scannedPet.name || 'P')[0].toUpperCase()}
              </div>
              <div className="ph-pet-info">
                <h2 className="ph-pet-name">{scannedPet.name || '—'}</h2>
                <p className="ph-pet-meta">
                  {[scannedPet.species, scannedPet.breed].filter(Boolean).join(' · ')}
                  {scannedPet.gender ? ` · ${scannedPet.gender}` : ''}
                  {scannedPet.dob ? ` · DOB: ${new Date(scannedPet.dob).toLocaleDateString()}` : ''}
                  {scannedPet.owner?.firstname ? ` · Owner: ${scannedPet.owner.firstname} ${scannedPet.owner.lastname || ''}`.trim() : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                <button className="new-record-button" onClick={() => setIsModalOpen(true)}>
                  <Plus className="button-icon" /> New Record
                </button>
                <button className="new-record-button" onClick={() => setIsVaccinationModalOpen(true)}>
                  <Plus className="button-icon" /> New Vaccination
                </button>
              </div>
            </div>
          )}

          {/* Health loading */}
          {petHealthLoading && (
            <div className="ph-state">
              <div className="ph-spinner" />
              Loading health history…
            </div>
          )}

          {/* Health error */}
          {petHealthError && !petHealthLoading && (
            <div className="ph-state ph-state--error">
              <AlertCircle size={28} />
              {petHealthError}
            </div>
          )}

          {/* ── Health results ── */}
          {petHealth && !petHealthLoading && (() => {
            const activeVax  = petHealth.vaccinations?.active  || [];
            const overdueVax = petHealth.vaccinations?.overdue || [];
            const medRecs    = petHealth.medicalRecords || [];

            const activeSlice  = activeVax.slice((vaxActivePage - 1) * HEALTH_PAGE_SIZE, vaxActivePage * HEALTH_PAGE_SIZE);
            const overdueSlice = overdueVax.slice((vaxOverduePage - 1) * HEALTH_PAGE_SIZE, vaxOverduePage * HEALTH_PAGE_SIZE);
            const medSlice     = medRecs.slice((medPage - 1) * HEALTH_PAGE_SIZE, medPage * HEALTH_PAGE_SIZE);

            return (
              <div className="ph-results">

                {/* Vaccinations */}
                <section className="ph-section">
                  <h3 className="ph-section-title"><Syringe size={16} /> Vaccinations</h3>

                  {/* Active / upcoming */}
                  <div className="ph-subsection">
                    <div className="ph-subsection-label ph-subsection-label--active">
                      <span>Active / Upcoming ({activeVax.length})</span>
                    </div>
                    {activeVax.length === 0 ? (
                      <p className="ph-scan-idle-text" style={{ padding: '0.5rem 0' }}>No active vaccinations on record.</p>
                    ) : (
                      <>
                        <div className="ph-vax-grid">
                          {activeSlice.map((v, i) => (
                            <div key={v._id || i} className="ph-vax-card ph-vax-card--active">
                              <div className="ph-vax-top">
                                <span className="ph-vax-name">{v.vaccineName || v.vaccine?.name || '—'}</span>
                                <span className={`ph-vax-status ph-vax-status--${(v.status||'').toLowerCase()}`}>{v.status || '—'}</span>
                              </div>
                              {(v.vaccineType || v.dose) && (
                                <div className="ph-vax-detail-row">
                                  {v.vaccineType && <span className="ph-vax-type">{v.vaccineType}</span>}
                                  {v.dose && <span className="ph-vax-dose">Dose: {v.dose}</span>}
                                  {v.route && <span className="ph-vax-dose">{v.route}</span>}
                                </div>
                              )}
                              <div className="ph-vax-dates">
                                <span><Calendar size={12} /> {v.administeredDate ? new Date(v.administeredDate).toLocaleDateString() : '—'}</span>
                                {v.nextDueDate && <span><span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Next:</span> {new Date(v.nextDueDate).toLocaleDateString()}</span>}
                              </div>
                              {v.veterinarian && (
                                <p className="ph-vax-vet">Dr. {v.veterinarian.firstname} {v.veterinarian.lastname}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        {activeVax.length > HEALTH_PAGE_SIZE && (
                          <div className="pagination-container" style={{ paddingTop: '0.5rem' }}>
                            <p className="pagination-info">
                              {(vaxActivePage-1)*HEALTH_PAGE_SIZE+1}–{Math.min(vaxActivePage*HEALTH_PAGE_SIZE, activeVax.length)} of {activeVax.length}
                            </p>
                            <div className="pagination-buttons">
                              <button className="pagination-button" disabled={vaxActivePage===1} onClick={() => setVaxActivePage(p=>p-1)}>Prev</button>
                              <button className="pagination-button" disabled={vaxActivePage*HEALTH_PAGE_SIZE>=activeVax.length} onClick={() => setVaxActivePage(p=>p+1)}>Next</button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Overdue */}
                  {overdueVax.length > 0 && (
                    <div className="ph-subsection">
                      <div className="ph-subsection-label ph-subsection-label--overdue">
                        <AlertCircle size={13} /> Overdue ({overdueVax.length})
                      </div>
                      <div className="ph-vax-grid">
                        {overdueSlice.map((v, i) => (
                          <div key={v._id || i} className="ph-vax-card ph-vax-card--overdue">
                            <div className="ph-vax-top">
                              <span className="ph-vax-name">{v.vaccineName || v.vaccine?.name || '—'}</span>
                              <span className="ph-vax-status ph-vax-status--overdue">Overdue</span>
                            </div>
                            <div className="ph-vax-dates">
                              <span><Calendar size={12} /> {v.administeredDate ? new Date(v.administeredDate).toLocaleDateString() : '—'}</span>
                              {v.nextDueDate && <span style={{ color: 'var(--color-danger,#dc2626)' }}>Was due: {new Date(v.nextDueDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                      {overdueVax.length > HEALTH_PAGE_SIZE && (
                        <div className="pagination-container" style={{ paddingTop: '0.5rem' }}>
                          <p className="pagination-info">{(vaxOverduePage-1)*HEALTH_PAGE_SIZE+1}–{Math.min(vaxOverduePage*HEALTH_PAGE_SIZE, overdueVax.length)} of {overdueVax.length}</p>
                          <div className="pagination-buttons">
                            <button className="pagination-button" disabled={vaxOverduePage===1} onClick={() => setVaxOverduePage(p=>p-1)}>Prev</button>
                            <button className="pagination-button" disabled={vaxOverduePage*HEALTH_PAGE_SIZE>=overdueVax.length} onClick={() => setVaxOverduePage(p=>p+1)}>Next</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Medical Records */}
                <section className="ph-section">
                  <h3 className="ph-section-title">
                    <FileText size={16} /> Medical Visit History ({medRecs.length})
                  </h3>

                  {medRecs.length === 0 ? (
                    <p className="ph-scan-idle-text" style={{ padding: '0.5rem 0' }}>No medical records on file.</p>
                  ) : (
                    <>
                      <div className="ph-records-list">
                        {medSlice.map((rec, i) => {
                          const key = rec._id || i;
                          const isOpen = expandedMed === key;
                          return (
                            <div key={key} className={`ph-record-item${isOpen ? ' ph-record-item--open' : ''}`}>
                              <button className="ph-record-header" onClick={() => setExpandedMed(isOpen ? null : key)}>
                                <div className="ph-record-header-left">
                                  <span className="ph-record-type-badge">{rec.visitType || 'Visit'}</span>
                                  <span className="ph-record-date">
                                    <Calendar size={13} />
                                    {rec.visitDate ? new Date(rec.visitDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                                  </span>
                                  {rec.diagnosis?.primary && (
                                    <span className="ph-record-diagnosis">{rec.diagnosis.primary}</span>
                                  )}
                                </div>
                                <div className="ph-record-header-right">
                                  {rec.veterinarian && (
                                    <span className="ph-record-vet">Dr. {rec.veterinarian.firstname} {rec.veterinarian.lastname}</span>
                                  )}
                                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                              </button>

                              {isOpen && (
                                <div className="ph-record-body">
                                  {rec.presentingComplaints?.length > 0 && (
                                    <div className="ph-rec-section">
                                      <p className="ph-rec-label">Presenting Complaints</p>
                                      <div className="ph-chip-list">
                                        {rec.presentingComplaints.map((c, ci) => (
                                          <span key={ci} className="ph-chip">{c.symptom}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {rec.diagnosis && (rec.diagnosis.primary || rec.diagnosis.severity) && (
                                    <div className="ph-rec-section">
                                      <p className="ph-rec-label">Diagnosis</p>
                                      <div className="ph-rec-kv-grid">
                                        {rec.diagnosis.primary && (
                                          <div className="ph-rec-kv">
                                            <span className="ph-rec-kv-label">Primary</span>
                                            <span className="ph-rec-kv-value">{rec.diagnosis.primary}</span>
                                          </div>
                                        )}
                                        {rec.diagnosis.severity && (
                                          <div className="ph-rec-kv">
                                            <span className="ph-rec-kv-label">Severity</span>
                                            <span className={`ph-severity ph-severity--${rec.diagnosis.severity.toLowerCase()}`}>{rec.diagnosis.severity}</span>
                                          </div>
                                        )}
                                      </div>
                                      {rec.diagnosis.differentials?.length > 0 && (
                                        <div className="ph-chip-list" style={{ marginTop: '0.5rem' }}>
                                          {rec.diagnosis.differentials.map((d, di) => (
                                            <span key={di} className="ph-chip ph-chip--secondary">{d}</span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {rec.prescriptions?.length > 0 && (
                                    <div className="ph-rec-section">
                                      <p className="ph-rec-label">Prescriptions</p>
                                      <div className="ph-rx-table-wrap">
                                        <table className="ph-rx-table">
                                          <thead><tr><th>Drug</th><th>Dose</th><th>Route</th><th>Frequency</th><th>Duration</th></tr></thead>
                                          <tbody>
                                            {rec.prescriptions.map((rx, ri) => (
                                              <tr key={ri}>
                                                <td>{rx.drugName||'—'}</td><td>{rx.dose||'—'}</td>
                                                <td>{rx.route||'—'}</td><td>{rx.frequency||'—'}</td>
                                                <td>{rx.durationDays ? `${rx.durationDays}d` : '—'}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                  {rec.treatmentNotes && (
                                    <div className="ph-rec-section">
                                      <p className="ph-rec-label">Treatment Notes</p>
                                      <p className="ph-rec-notes">{rec.treatmentNotes}</p>
                                    </div>
                                  )}
                                  {rec.generalNotes && (
                                    <div className="ph-rec-section">
                                      <p className="ph-rec-label">General Notes</p>
                                      <p className="ph-rec-notes">{rec.generalNotes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {medRecs.length > HEALTH_PAGE_SIZE && (
                        <div className="pagination-container">
                          <p className="pagination-info">
                            Showing {(medPage-1)*HEALTH_PAGE_SIZE+1}–{Math.min(medPage*HEALTH_PAGE_SIZE, medRecs.length)} of {medRecs.length} visits
                          </p>
                          <div className="pagination-buttons">
                            <button className="pagination-button" disabled={medPage===1} onClick={() => { setMedPage(p=>p-1); setExpandedMed(null); }}>Previous</button>
                            {Array.from({ length: Math.ceil(medRecs.length / HEALTH_PAGE_SIZE) }).map((_, idx) => (
                              <button key={idx} className={`pagination-button${medPage===idx+1?' pagination-active':''}`} onClick={() => { setMedPage(idx+1); setExpandedMed(null); }}>{idx+1}</button>
                            ))}
                            <button className="pagination-button" disabled={medPage*HEALTH_PAGE_SIZE>=medRecs.length} onClick={() => { setMedPage(p=>p+1); setExpandedMed(null); }}>Next</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </section>
              </div>
            );
          })()}
        </div>
      )}

      <NewRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pet={scannedPet}
        onSuccess={({ type, message }) => {
          toast[type]?.(message);
          if (type === 'success') triggerRefresh();
        }}
      />
      <VaccinationModal
        isOpen={isVaccinationModalOpen}
        onClose={() => setIsVaccinationModalOpen(false)}
        pet={scannedPet}
        onSuccess={({ type, message }) => {
          toast[type]?.(message);
          if (type === 'success') triggerVaxRefresh();
        }}
      />
      <RecordDetailModal
        isOpen={!!selectedRecordId}
        recordId={selectedRecordId}
        onClose={() => setSelectedRecordId(null)}
      />
      <VaccinationDetailModal
        isOpen={!!selectedVaxId}
        vaccinationId={selectedVaxId}
        onClose={() => setSelectedVaxId(null)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function vaxStatusClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'completed':  return 'status-active';
    case 'upcoming':   return 'status-upcoming';
    case 'overdue':
    case 'missed':     return 'status-overdue';
    default:           return 'status-followup';
  }
}

export default MedicalRecords;