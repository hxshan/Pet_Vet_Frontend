import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import '../assets/styles/vaccinationModal.css';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/useAuth.js';

// QR scanning helpers
const defaultVideoWidth = 640;
const defaultVideoHeight = 480;

// (no static mock pets — pet lookup uses QR token endpoint)

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export function VaccinationModal({ isOpen, onClose }) {
  const [, setSelectedPet] = useState(null);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanAnimationRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    route: 'Subcutaneous',
    administeredDate: getTodayDate(),
    veterinarian: 'Dr. Sarah Johnson',
    batchNumber: ''
  });
  useEffect(() => {
    // fetch vaccine catalog
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch('vaccination/catalog');
        if (!mounted) return;
        if (res.ok && res.data && Array.isArray(res.data.vaccines)) {
          setVaccines(res.data.vaccines);
        } else {
          setVaccines([]);
        }
      } catch (err) {
        console.error('Failed to load vaccine catalog', err);
        if (mounted) setVaccines([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, veterinarian: `${user.firstname || ''} ${user.lastname || ''}`.trim() || prev.veterinarian }));
    }
  }, [user]);

  const selectedVaccine = vaccines && formData.vaccineId ? vaccines.find(v => v._id === formData.vaccineId) : null;

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setFormData({ ...formData, pet_id: pet._id, petOwner: pet.owner?._id, owner_name: pet.owner?.firstname ? `${pet.owner.firstname} ${pet.owner.lastname || ''}`.trim() : (pet.owner?.name || ''), owner_phone: pet.owner?.phone || '', owner_email: pet.owner?.email || '' });
  };

  const fetchPetByToken = async (token) => {
    setScanError('');
    try {
      const { ok, status, data } = await apiFetch(`pet/token/${token}`);
      if (!ok) {
        setScanError((data && data.message) || `Pet not found (${status})`);
        return;
      }
      handlePetSelect(data.data);
    } catch (err) {
      console.error('fetchPetByToken error', err);
      setScanError('Network error while fetching pet');
    }
  };

  const stopScan = async (stream) => {
    setScanning(false);
    if (scanAnimationRef.current) {
      cancelAnimationFrame(scanAnimationRef.current);
      scanAnimationRef.current = null;
    }
    if (videoRef.current) {
      const s = videoRef.current.srcObject || stream;
      if (s && s.getTracks) {
        s.getTracks().forEach((t) => t.stop());
      }
      videoRef.current.srcObject = null;
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
            const w = videoRef.current.videoWidth || defaultVideoWidth;
            const h = videoRef.current.videoHeight || defaultVideoHeight;
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
              setScanError('QR scanning not supported in this browser - please use a supported browser');
              await stopScan(stream);
              return;
            }
          }
        } catch (err) {
          console.error('Scan error', err);
          setScanError('Error while scanning');
          await stopScan(stream);
          return;
        }
        scanAnimationRef.current = requestAnimationFrame(scanLoop);
      };

      setScanning(true);
      scanAnimationRef.current = requestAnimationFrame(scanLoop);
    } catch (err) {
      console.error('Camera error', err);
      setScanError('Could not access camera');
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // Build payload according to backend contract
    const payload = {
      pet: formData.pet_id,
      petOwner: formData.petOwner,
      vaccineId: formData.vaccineId || undefined,
      vaccineName: formData.vaccineName || undefined,
      batchNumber: formData.manufacturer || '',
      administeredAt: formData.administeredDate ? new Date(formData.administeredDate).toISOString() : new Date().toISOString(),
      dose: formData.dose || '',
      route: formData.route || '',
      notes: formData.notes || '',
    };

    (async () => {
      try {
        if (scanning) await stopScan();
        const body = {
          pet: payload.pet,
          petOwner: payload.petOwner,
          vaccineId: payload.vaccineId,
          dose: payload.dose,
          doseNumber: payload.doseNumber,
          batchNumber: formData.batchNumber || '',
          administeredAt: payload.administeredAt,
          nextDueDate: formData.nextDueDate ? new Date(formData.nextDueDate).toISOString() : undefined,
          route: payload.route,
          notes: payload.notes
        };

        const res = await apiFetch('vaccination', { method: 'POST', body });
        if (res.ok) {
          // optionally notify parent or refresh listing
          onClose();
        } else {
          console.error('Failed to save vaccination', res);
          // show basic error to user
          alert((res.data && res.data.message) || `Failed to save vaccination (${res.status})`);
        }
      } catch (err) {
        console.error('Error saving vaccination', err);
        alert('Network error while saving vaccination');
      }
    })();
  };

  if (!isOpen) return null;

  return (
    <div className="vaccination-modal-overlay">
      <div className="vaccination-modal-container">
        {/* Header */}
        <div className="vaccination-modal-header">
          <div>
            <h2 className="vaccination-modal-title">New Vaccination Record</h2>
            <p className="vaccination-modal-subtitle">Record a new vaccination for a patient</p>
          </div>
          <button onClick={onClose} className="vaccination-modal-close-btn">
            <X className="vaccination-icon-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="vaccination-modal-content">
          <div className="vaccination-section-container">
            <h3 className="vaccination-section-header">
              <div className="vaccination-section-accent"></div>
              Vaccination Information
            </h3>
            <div className="vaccination-form-space">
              {/* Pet lookup via QR scan (preferred) or manual token fallback */}
              <div className="vaccination-pet-scan-container">
                <label className="vaccination-form-label">Pet *</label>
                {formData.pet_id ? (
                  <div className="vaccination-selected-pet">
                    <div><strong>Pet ID:</strong> {formData.pet_id}</div>
                    <div><strong>Owner:</strong> {formData.owner_name || '—'}</div>
                    <div><strong>Phone:</strong> {formData.owner_phone || '—'}</div>
                  </div>
                ) : (
                  <div className="vaccination-scan-controls">
                    <video ref={videoRef} className="scan-video" playsInline muted />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="scan-buttons-row">
                      {!scanning ? (
                        <button type="button" onClick={startScan} className="scan-button">Start Scan</button>
                      ) : (
                        <button type="button" onClick={() => stopScan()} className="scan-button scan-button-stop">Stop Scan</button>
                      )}
                    </div>
                    {scanError && <div className="scan-error">{scanError}</div>}
                  </div>
                )}
              </div>

              {/* Vaccine Name */}
              <div>
                <label className="vaccination-form-label">Vaccine *</label>
                <select
                  value={formData.vaccineId || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    const chosen = vaccines.find(v => v._id === id);
                    if (chosen) {
                      // calculate next due date from defaultIntervalDays
                      let formatted = '';
                      if (chosen.defaultIntervalDays && formData.administeredDate) {
                        try {
                          const ad = new Date(formData.administeredDate);
                          const next = new Date(ad.getTime() + (chosen.defaultIntervalDays * 24 * 60 * 60 * 1000));
                          formatted = next.toISOString().split('T')[0];
                        } catch (err) {
                          console.warn('Error calculating next due date', err);
                        }
                      }
                      setFormData(prev => ({
                        ...prev,
                        vaccineId: id,
                        dose: Array.isArray(chosen.doses) && chosen.doses.length > 0 ? chosen.doses[0] : prev.dose,
                        catalogManufacturer: chosen.manufacturer || '',
                        nextDueDate: formatted || prev.nextDueDate
                      }));
                    } else {
                      // cleared selection
                      setFormData(prev => ({ ...prev, vaccineId: '', dose: '', catalogManufacturer: '' }));
                    }
                  }}
                  className="vaccination-form-select"
                >
                  <option value="">Select vaccine</option>
                  {vaccines && vaccines.length > 0 ? (
                    vaccines.map(v => (
                      <option key={v._id} value={v._id}>{v.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>No vaccines available</option>
                  )}
                </select>
              </div>

              {/* Catalog Manufacturer (read-only) and Batch Number */}
              <div>
                <label className="vaccination-form-label">Manufacturer (catalog)</label>
                <input
                  type="text"
                  value={formData.catalogManufacturer || ''}
                  readOnly
                  className="vaccination-form-input vaccination-form-input-readonly"
                />
              </div>

              <div>
                <label className="vaccination-form-label">Batch Number</label>
                <input
                  type="text"
                  value={formData.batchNumber || ''}
                  onChange={(e) => handleFieldChange('batchNumber', e.target.value)}
                  placeholder="Enter batch number"
                  className="vaccination-form-input"
                />
              </div>

              {/* Dose and Route */}
              <div className="vaccination-grid vaccination-grid-md-2">
                <div>
                  <label className="vaccination-form-label">Dose *</label>
                  {selectedVaccine && Array.isArray(selectedVaccine.doses) && selectedVaccine.doses.length > 0 ? (
                    <select
                      value={formData.dose || ''}
                      onChange={(e) => handleFieldChange('dose', e.target.value)}
                      className="vaccination-form-select"
                    >
                      <option value="">Select dose</option>
                      {selectedVaccine.doses.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.dose || ''}
                      onChange={(e) => handleFieldChange('dose', e.target.value)}
                      placeholder="e.g., 1 ml or 0.5 mg/kg"
                      className="vaccination-form-input"
                    />
                  )}
                </div>
                <div>
                  <label className="vaccination-form-label">Route *</label>
                  <select
                    value={formData.route || 'Subcutaneous'}
                    onChange={(e) => handleFieldChange('route', e.target.value)}
                    className="vaccination-form-select"
                  >
                    <option value="">Select route</option>
                    {['Subcutaneous', 'Intramuscular', 'Oral'].map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="vaccination-grid vaccination-grid-md-2">
                <div>
                  <label className="vaccination-form-label">Administered Date *</label>
                  <input
                    type="date"
                    value={formData.administeredDate || getTodayDate()}
                    onChange={(e) => handleFieldChange('administeredDate', e.target.value)}
                    className="vaccination-form-input"
                  />
                </div>
                <div>
                  <label className="vaccination-form-label">Next Due Date</label>
                  <input
                    type="date"
                    value={formData.nextDueDate || ''}
                    onChange={(e) => handleFieldChange('nextDueDate', e.target.value)}
                    placeholder="Optional - auto calculated"
                    className="vaccination-form-input"
                  />
                </div>
              </div>

              {/* Veterinarian */}
              <div>
                <label className="vaccination-form-label">Veterinarian *</label>
                <input
                  type="text"
                  value={formData.veterinarian || 'Dr. Sarah Johnson'}
                  readOnly
                  className="vaccination-form-input vaccination-form-input-readonly"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="vaccination-form-label">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  rows={4}
                  placeholder="Optional notes (reaction, injection site, instructions)"
                  className="vaccination-form-textarea"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="vaccination-modal-footer">
          <button onClick={onClose} className="vaccination-cancel-btn">
            Cancel
          </button>
          <button onClick={handleSubmit} className="vaccination-save-btn" disabled={!formData.pet_id || !formData.vaccineId}>
            Save Vaccination Record
          </button>
        </div>
      </div>
    </div>
  );
}
