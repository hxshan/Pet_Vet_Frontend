import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, User, Briefcase, Check } from 'lucide-react';
import '../assets/styles/signup.css';

function Signup({ navigate }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nicNumber: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    clinicId: '',
    clinicName: '',
    clinicAddress: '',
    clinicLat: null,
    clinicLng: null,
    clinicPlaceId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  // clinic search/autocomplete state
  const [clinicQuery, setClinicQuery] = useState('');
  const [clinicSuggestions, setClinicSuggestions] = useState([]);
  const [isSearchingClinics, setIsSearchingClinics] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const clinicTimer = useRef(null);
  const clinicAddressRef = useRef(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Helper to load Google Maps JS dynamically. Reads API key from Vite env var VITE_GOOGLE_MAPS_API_KEY
  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('No window'));
      if (window.google && window.google.maps) return resolve(window.google);

      // Try to read API key from env injected by Vite
      const apiKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) || window.__VITE_GOOGLE_MAPS_API_KEY__;
      if (!apiKey) return reject(new Error('Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in your environment.'));

      const callbackName = `gmaps_onload_${Date.now()}`;
      window[callbackName] = () => {
        resolve(window.google);
        delete window[callbackName];
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps JS'));
      };
      document.head.appendChild(script);
    });
  };

  // Initialize Google Map when map picker is shown
  useEffect(() => {
    if (!showMapPicker) return;
    if (typeof window === 'undefined') return;

    const initMap = (center) => {
      const mapEl = document.getElementById('mapCanvas');
      if (!mapEl) return;
      const map = new window.google.maps.Map(mapEl, {
        center,
        zoom: 13,
        gestureHandling: 'greedy',
        fullscreenControl: false
      });
      mapRef.current = map;

      const geocoder = new window.google.maps.Geocoder();

      const updateLocationFromLatLng = (latLng) => {
        try {
          const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
          const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
          setFormData(prev => ({ ...prev, clinicLat: lat, clinicLng: lng }));
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              setFormData(prev => ({ ...prev, clinicAddress: results[0].formatted_address, clinicPlaceId: results[0].place_id || prev.clinicPlaceId }));
            }
          });
        } catch {
          // ignore
        }
      };

      // create marker at center (or reuse existing)
      const marker = new window.google.maps.Marker({
        position: center,
        map,
        draggable: true
      });
      markerRef.current = marker;

      map.addListener('click', (e) => {
        try {
          if (!markerRef.current) {
            markerRef.current = new window.google.maps.Marker({ position: e.latLng, map, draggable: true });
            markerRef.current.addListener('dragend', () => updateLocationFromLatLng(markerRef.current.getPosition()));
          } else {
            markerRef.current.setPosition(e.latLng);
          }
          updateLocationFromLatLng(e.latLng);
        } catch {
          // ignore
        }
      });

      
      marker.addListener('dragend', () => {
        try {
          updateLocationFromLatLng(markerRef.current.getPosition());
        } catch {
          // ignore
        }
      });

      // improve UX: add a subtle overlay instruction
      const instr = document.createElement('div');
      instr.style.position = 'absolute';
      instr.style.top = '10px';
      instr.style.left = '10px';
      instr.style.padding = '6px 10px';
      instr.style.background = 'rgba(255,255,255,0.9)';
      instr.style.borderRadius = '6px';
      instr.style.fontSize = '13px';
      instr.style.color = '#374151';
      instr.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
      instr.innerText = 'Click map to place marker. Drag marker to fine-tune.';
      mapEl.style.position = 'relative';
      mapEl.appendChild(instr);
    };

    // default center (Colombo) if nothing else
    let initialCenter = { lat: 6.9271, lng: 79.8612 };

    const setup = async () => {
      try {
        if (!window.google || !window.google.maps) {
          await loadGoogleMaps();
        }

        if (formData.clinicLat && formData.clinicLng) {
          initialCenter = { lat: Number(formData.clinicLat), lng: Number(formData.clinicLng) };
          initMap(initialCenter);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              initMap(center);
            },
            () => {
              initMap(initialCenter);
            },
            { timeout: 3000 }
          );
        } else {
          initMap(initialCenter);
        }
      } catch (err) {
        console.warn('Failed to load Google Maps for map picker', err);
      }
    };

    setup();

    return () => {
      // cleanup map listeners
      try {
        if (mapRef.current) {
          window.google.maps.event.clearInstanceListeners(mapRef.current);
        }
      } catch {
        // ignore
      }
      mapRef.current = null;
      // keep markerRef until modal closed; clear it
      markerRef.current = null;
    };
  }, [showMapPicker, formData.clinicLat, formData.clinicLng]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // when clinicName changes we treat it as search query unless a clinic is already selected
  useEffect(() => {
    if (!clinicQuery || clinicQuery.trim().length < 2) {
      setClinicSuggestions([]);
      return;
    }

    setIsSearchingClinics(true);
    // debounce
    if (clinicTimer.current) clearTimeout(clinicTimer.current);
    clinicTimer.current = setTimeout(async () => {
      try {
        const api = (await import('../utils/api')).apiFetch;
        const { ok, data } = await api(`clinics?q=${encodeURIComponent(clinicQuery.trim())}&limit=6`);
        if (ok && data && Array.isArray(data.clinics)) {
          setClinicSuggestions(data.clinics);
        } else {
          setClinicSuggestions([]);
        }
      } catch (err) {
        console.error('Clinic search error', err);
        setClinicSuggestions([]);
      } finally {
        setIsSearchingClinics(false);
      }
    }, 300);

    return () => {
      if (clinicTimer.current) clearTimeout(clinicTimer.current);
    };
  }, [clinicQuery]);

  // Initialize Google Places Autocomplete when the clinic address input is mounted
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!clinicAddressRef.current) return;
    const ensureAutocomplete = async () => {
      try {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          await loadGoogleMaps();
        }
        const autocomplete = new window.google.maps.places.Autocomplete(clinicAddressRef.current, {
          fields: ['formatted_address', 'geometry', 'place_id', 'name']
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place) return;
          const address = place.formatted_address || place.name || '';
          const lat = place.geometry && place.geometry.location ? place.geometry.location.lat() : null;
          const lng = place.geometry && place.geometry.location ? place.geometry.location.lng() : null;

          setFormData(prev => ({
            ...prev,
            clinicAddress: address,
            clinicLat: lat,
            clinicLng: lng,
            clinicPlaceId: place.place_id || ''
          }));
          // If map already initialized, center marker on selected place
          try {
            if (lat !== null && lng !== null && window.google && window.google.maps && mapRef.current) {
              const latLng = new window.google.maps.LatLng(lat, lng);
              mapRef.current.panTo(latLng);
              mapRef.current.setZoom(15);
              if (markerRef.current && markerRef.current.setPosition) {
                markerRef.current.setPosition(latLng);
              } else {
                markerRef.current = new window.google.maps.Marker({ position: latLng, map: mapRef.current, draggable: true });
                // attach drag listener to update coords/address when user drags marker after selecting from autocomplete
                try {
                  const geocoder = new window.google.maps.Geocoder();
                  markerRef.current.addListener('dragend', () => {
                    try {
                      const pos = markerRef.current.getPosition();
                      const la = pos.lat();
                      const lo = pos.lng();
                      setFormData(prev => ({ ...prev, clinicLat: la, clinicLng: lo }));
                      geocoder.geocode({ location: { lat: la, lng: lo } }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                          setFormData(prev => ({ ...prev, clinicAddress: results[0].formatted_address, clinicPlaceId: results[0].place_id || prev.clinicPlaceId }));
                        }
                      });
                    } catch {
                      // ignore
                    }
                  });
                } catch {
                  // ignore
                }
              }
            }
          } catch {
            // ignore
          }
          setClinicSuggestions([]);
          setClinicQuery('');
        });
      } catch {
        // if loader failed, leave autocomplete unavailable; user can still pick on map when key provided
        console.warn('Places Autocomplete not available');
      }
    };

    ensureAutocomplete();
  }, []);

  const handleSelectClinic = (clinic) => {
    setSelectedClinic(clinic);
    setFormData(prev => ({
      ...prev,
      clinicId: clinic._id,
      clinicName: clinic.name,
      clinicAddress: clinic.address || prev.clinicAddress,
      clinicLat: clinic.location && clinic.location.coordinates ? clinic.location.coordinates[1] : null,
      clinicLng: clinic.location && clinic.location.coordinates ? clinic.location.coordinates[0] : null,
      clinicPlaceId: clinic.placeId || ''
    }));
    setClinicSuggestions([]);
    setClinicQuery('');
  };

  const clearSelectedClinic = () => {
    setSelectedClinic(null);
    setFormData(prev => ({ ...prev, clinicId: '' }));
  };

  const validateStep1 = () => {
    const { firstname, lastname, nicNumber, email, phone, password, confirmPassword } = formData;
    
    if (!firstname || !lastname || !nicNumber || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setError('');
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async () => {
    const { licenseNumber, specialization, yearsOfExperience, clinicId, clinicName, clinicAddress } = formData;

    // Require either an existing clinicId or new clinicName+clinicAddress
    if (!licenseNumber || !specialization || !yearsOfExperience) {
      setError('Please fill in all required fields');
      return;
    }

    if (!clinicId && (!clinicName || !clinicAddress)) {
      setError('Provide an existing Clinic ID or enter Clinic Name and Address to create a clinic');
      return;
    }

    // If user is creating a new clinic (not joining), require valid coordinates (they must pick on the map or choose an address)
    const coordsValid = (lat, lng) => {
      const a = Number(lat);
      const b = Number(lng);
      return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) > 0.000001 && Math.abs(b) > 0.000001;
    };

    if (!clinicId && !coordsValid(formData.clinicLat, formData.clinicLng)) {
      setError('Please pick a location on the map or select an address so the clinic coordinates are set.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

  const { confirmPassword: _, ...dataToSend } = formData;

    try {
      // Use shared api helper. Backend route for vet signup is auth/vet/signup
      const { ok, status, data } = await (await import('../utils/api')).apiFetch('auth/vet/signup', { method: 'POST', body: dataToSend });

      if (!ok) {
        setError(data && data.message ? data.message : `Signup failed (${status})`);
        setLoading(false);
        return;
      }

      setSuccess(data.message + ' ' + (data.note || ''));
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
          <div className="steps-indicator">
            <div className="step-item">
              <div className={`step-circle ${step >= 1 ? 'active' : ''}`}>
                {step > 1 ? <Check size={16} /> : <User size={16} />}
              </div>
              <span className="step-label">Personal Info</span>
            </div>
            <div className="step-item">
              <div className={`step-circle ${step >= 2 ? 'active' : ''}`}>
                <Briefcase size={16} />
              </div>
              <span className="step-label">Professional Info</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="signup-header">
          <h1>Veterinarian Registration</h1>
          <p>{step === 1 ? 'Step 1: Personal Information' : 'Step 2: Professional Information'}</p>
        </div>

        <div className="signup-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {step === 1 ? (
            // Step 1: Personal Information
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstname">First Name *</label>
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastname">Last Name *</label>
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nicNumber">NIC Number *</label>
                <input
                  type="text"
                  id="nicNumber"
                  name="nicNumber"
                  value={formData.nicNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter NIC number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <button onClick={handleNext} className="next-button">
                Next Step
                <ChevronRight size={20} className="button-icon-right" />
              </button>
            </div>
          ) : (
            // Step 2: Professional Information
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="licenseNumber">License Number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter veterinary license number"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="specialization">Specialization *</label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Small Animals"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="yearsOfExperience">Years of Experience *</label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Enter years"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Clinic</label>
                <div className="clinic-mode-tabs" style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button type="button" className={`tab-button ${formData.clinicMode === 'join' ? 'active' : ''}`} onClick={() => { setFormData(prev => ({ ...prev, clinicMode: 'join' })); setClinicQuery(''); setClinicSuggestions([]); setSelectedClinic(null); }}>
                    Join existing
                  </button>
                  <button type="button" className={`tab-button ${formData.clinicMode === 'create' ? 'active' : ''}`} onClick={() => { setFormData(prev => ({ ...prev, clinicMode: 'create', clinicId: '' })); setClinicQuery(''); setClinicSuggestions([]); setSelectedClinic(null); }}>
                    Create new
                  </button>
                </div>

                {/* Join existing clinic */}
                {formData.clinicMode === 'join' && (
                  <div>
                    {selectedClinic ? (
                      <div className="selected-clinic">
                        <strong>Selected:</strong> {selectedClinic.name}
                        <div className="selected-meta">{selectedClinic.address}</div>
                        <button type="button" onClick={clearSelectedClinic} className="change-clinic">Change</button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          id="clinicSearch"
                          name="clinicSearch"
                          value={clinicQuery}
                          onChange={(e) => {
                            setClinicQuery(e.target.value);
                          }}
                          placeholder="Type clinic name to search..."
                          autoComplete="off"
                          className="text-input"
                        />
                        {isSearchingClinics && <div className="clinic-search-loading">Searching...</div>}
                        {clinicSuggestions.length > 0 && (
                          <ul className="clinic-suggestions">
                            {clinicSuggestions.map((c) => (
                              <li key={c._id} onClick={() => handleSelectClinic(c)}>
                                <strong>{c.name}</strong>
                                <div className="suggestion-address">{c.address}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Create new clinic */}
                {formData.clinicMode === 'create' && (
                  <div className="create-clinic-grid">
                    <div className="form-group">
                      <label htmlFor="clinicNameInput">Clinic Name *</label>
                      <input
                        type="text"
                        id="clinicNameInput"
                        name="clinicName"
                        value={formData.clinicName}
                        onChange={(e) => setFormData(prev => ({ ...prev, clinicName: e.target.value }))}
                        placeholder="e.g. Happy Paws Veterinary Clinic"
                        className="text-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="clinicPhone">Clinic Phone</label>
                      <input type="text" id="clinicPhone" name="clinicPhone" value={formData.clinicPhone || ''} onChange={(e) => setFormData(prev => ({ ...prev, clinicPhone: e.target.value }))} className="text-input" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="clinicEmail">Clinic Email</label>
                      <input type="email" id="clinicEmail" name="clinicEmail" value={formData.clinicEmail || ''} onChange={(e) => setFormData(prev => ({ ...prev, clinicEmail: e.target.value }))} className="text-input" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="clinicAddress">Clinic Address</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          ref={clinicAddressRef}
                          id="clinicAddressCreate"
                          name="clinicAddress"
                          value={formData.clinicAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, clinicAddress: e.target.value }))}
                          placeholder="Type or choose an address"
                          className="text-input"
                        />
                        <button type="button" className="btn-small" onClick={() => setShowMapPicker(prev => !prev)}>
                          {showMapPicker ? 'Hide map' : 'Show map'}
                        </button>
                      </div>

                        {/* Guidance about selecting coordinates */}
                        <div style={{ marginTop: 8 }}>
                          {!formData.clinicLat || !formData.clinicLng ? (
                            <div className="help-text">Please select an address from autocomplete or pick a spot on the map. Picking a map pin is required to continue.</div>
                          ) : (
                            <div className="help-text success">Location selected — ready to submit.</div>
                          )}
                        </div>

                        {showMapPicker && (
                          <div className="clinic-map-inline" style={{ width: '100%', height: 320, marginTop: 12 }}>
                            <div id="mapCanvas" style={{ width: '100%', height: '100%', borderRadius: 8, border: '1px solid #e6e6e6' }} />
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Clinic address and inline map are handled inside the Create new clinic tab above. */}

              <div className="button-row">
                <button onClick={handleBack} className="back-button">
                  <ChevronLeft size={20} className="button-icon-left" />
                  Back
                </button>
                <button 
                  onClick={handleSubmit} 
                  className="signup-button"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          {/* Map picker is inline now (toggle above) */}

          <div className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;