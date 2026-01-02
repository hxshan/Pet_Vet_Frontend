import { useState, useRef, useEffect } from 'react';
import { X, Search, Plus, Trash2, Upload } from 'lucide-react';
import '../assets/styles/newRecordModal.css';


const mockPets = [
  { id: 'PET001', name: 'Max', species: 'Dog', breed: 'Golden Retriever', owner: { name: 'John Smith', phone: '555-0101', email: 'john@example.com' } },
  { id: 'PET002', name: 'Luna', species: 'Cat', breed: 'Persian', owner: { name: 'Emily Davis', phone: '555-0102', email: 'emily@example.com' } },
  { id: 'PET003', name: 'Charlie', species: 'Dog', breed: 'Beagle', owner: { name: 'Michael Brown', phone: '555-0103', email: 'michael@example.com' } },
  { id: 'PET004', name: 'Bella', species: 'Dog', breed: 'Labrador', owner: { name: 'Sarah Wilson', phone: '555-0104', email: 'sarah@example.com' } },
  { id: 'PET005', name: 'Whiskers', species: 'Cat', breed: 'Maine Coon', owner: { name: 'David Martinez', phone: '555-0105', email: 'david@example.com' } },
];

const mockVets = [
  { id: 'VET001', name: 'Dr. Sarah Johnson' },
  { id: 'VET002', name: 'Dr. Michael Chen' },
  { id: 'VET003', name: 'Dr. Emily Rodriguez' },
];

export function NewRecordModal({ isOpen, onClose }) {
  const [petSearch, setPetSearch] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [formData, setFormData] = useState({});
  const [medications, setMedications] = useState([{ id: 1 }]);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPetDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPets = mockPets.filter(pet => 
    pet.id.toLowerCase().includes(petSearch.toLowerCase()) ||
    pet.name.toLowerCase().includes(petSearch.toLowerCase()) ||
    pet.owner.name.toLowerCase().includes(petSearch.toLowerCase())
  );

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setPetSearch(`${pet.id} - ${pet.name} (${pet.species})`);
    setShowPetDropdown(false);
    setFormData({
      ...formData,
      pet_id: pet.id,
      owner_name: pet.owner.name,
      owner_phone: pet.owner.phone,
      owner_email: pet.owner.email,
    });
  };

  const handleFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleCheckboxChange = (key, option, checked) => {
    const current = formData[key] || [];
    if (checked) {
      handleFieldChange(key, [...current, option]);
    } else {
      handleFieldChange(key, current.filter((item) => item !== option));
    }
  };

  const addMedication = () => {
    setMedications([...medications, { id: Date.now() }]);
  };

  const removeMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New Medical Record</h2>
            <p className="modal-subtitle">Complete patient examination and visit details</p>
          </div>
          <button onClick={onClose} className="close-button">
            <X className="icon-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Visit / Case Header */}
          <div className="section section-blue">
            <h3 className="section-title">
              <div className="section-indicator section-indicator-blue"></div>
              Visit / Case Header
            </h3>
            <div className="form-section">
              {/* Pet Searchable Dropdown */}
              <div ref={dropdownRef} className="dropdown-container">
                <label className="form-label">Pet *</label>
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    value={petSearch}
                    onChange={(e) => {
                      setPetSearch(e.target.value);
                      setShowPetDropdown(true);
                    }}
                    onFocus={() => setShowPetDropdown(true)}
                    placeholder="Search by Pet ID, name, or owner"
                    className="search-input"
                  />
                </div>
                {showPetDropdown && (
                  <div className="dropdown-menu">
                    {filteredPets.length > 0 ? (
                      filteredPets.map(pet => (
                        <button
                          key={pet.id}
                          onClick={() => handlePetSelect(pet)}
                          className="dropdown-item"
                        >
                          <div className="dropdown-item-title">{pet.id} - {pet.name}</div>
                          <div className="dropdown-item-subtitle">{pet.species} ({pet.breed}) - Owner: {pet.owner.name}</div>
                        </button>
                      ))
                    ) : (
                      <div className="dropdown-empty">No pets found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Owner Information */}
              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label">Owner Name</label>
                  <input
                    type="text"
                    value={formData.owner_name || ''}
                    readOnly
                    className="form-input readonly"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Phone</label>
                  <input
                    type="text"
                    value={formData.owner_phone || ''}
                    readOnly
                    className="form-input readonly"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Email</label>
                  <input
                    type="text"
                    value={formData.owner_email || ''}
                    readOnly
                    className="form-input readonly"
                  />
                </div>
              </div>

              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label">Visit Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.visit_datetime || ''}
                    onChange={(e) => handleFieldChange('visit_datetime', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vet / Clinician</label>
                  <select
                    value={formData.vet_id || ''}
                    onChange={(e) => handleFieldChange('vet_id', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select vet</option>
                    {mockVets.map(vet => (
                      <option key={vet.id} value={vet.id}>{vet.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Visit Type</label>
                  <select
                    value={formData.visit_type || ''}
                    onChange={(e) => handleFieldChange('visit_type', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select type</option>
                    {['Routine', 'Emergency', 'Follow-up', 'Vaccination'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Presenting Complaint */}
          <div className="section section-white">
            <h3 className="section-title">
              <div className="section-indicator section-indicator-purple"></div>
              Presenting Complaint
            </h3>
            <div className="form-section">
              <div className="form-group">
                <label className="form-label mb-3">Primary Complaint</label>
                <div className="checkbox-grid">
                  {['Vomiting', 'Diarrhea', 'Coughing', 'Sneezing', 'Itching', 'Hair Loss', 'Red Skin', 'Ear Scratching', 'Ear Discharge', 'Lethargy', 'Loss of Appetite', 'Constipation', 'Bloody Stool', 'Wound Present', 'Other'].map(option => (
                    <label key={option} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={(formData.primary_complaint || []).includes(option)}
                        onChange={(e) => handleCheckboxChange('primary_complaint', option, e.target.checked)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Duration / Onset</label>
                <input
                  type="text"
                  value={formData.complaint_duration || ''}
                  onChange={(e) => handleFieldChange('complaint_duration', e.target.value)}
                  placeholder="e.g., 2 days"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Examination / Clinical Findings */}
          <div className="section section-white">
            <h3 className="section-title">
              <div className="section-indicator section-indicator-green"></div>
              Examination / Clinical Findings
            </h3>
            <div className="form-section-lg">
              {/* Vital Signs */}
              <div className="vitals-box">
                <h4 className="subsection-title">Vital Signs</h4>
                <div className="grid grid-5">
                  <div className="form-group">
                    <label className="form-label-sm">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temperature || ''}
                      onChange={(e) => handleFieldChange('temperature', e.target.value)}
                      className="form-input-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-sm">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={formData.heart_rate || ''}
                      onChange={(e) => handleFieldChange('heart_rate', e.target.value)}
                      className="form-input-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-sm">Respiratory Rate</label>
                    <input
                      type="number"
                      value={formData.respiratory_rate || ''}
                      onChange={(e) => handleFieldChange('respiratory_rate', e.target.value)}
                      className="form-input-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-sm">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight || ''}
                      onChange={(e) => handleFieldChange('weight', e.target.value)}
                      className="form-input-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-sm">Body Condition Score</label>
                    <select
                      value={formData.body_condition_score || ''}
                      onChange={(e) => handleFieldChange('body_condition_score', e.target.value)}
                      className="form-input-sm"
                    >
                      <option value="">Select</option>
                      {['1','2','3','4','5','6','7','8','9'].map(score => (
                        <option key={score} value={score}>{score}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Physical Examination */}
              <div className="form-group">
                <h4 className="subsection-title">Physical Examination</h4>
                <div className="exam-grid">
                  {/* Eyes */}
                  <div className="exam-card">
                    <label className="exam-card-title">👁️ Eyes</label>
                    <div className="exam-options">
                      {['Redness', 'Discharge', 'Cloudiness', 'Other'].map(option => (
                        <label key={option} className="exam-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.eyes_findings || []).includes(option)}
                            onChange={(e) => handleCheckboxChange('eyes_findings', option, e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Ears */}
                  <div className="exam-card">
                    <label className="exam-card-title">👂 Ears</label>
                    <div className="exam-options">
                      {['Scratching', 'Discharge', 'Redness', 'Other'].map(option => (
                        <label key={option} className="exam-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.ears_findings || []).includes(option)}
                            onChange={(e) => handleCheckboxChange('ears_findings', option, e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Nose & Throat */}
                  <div className="exam-card">
                    <label className="exam-card-title">👃 Nose & Throat</label>
                    <div className="exam-options">
                      {['Sneezing', 'Discharge', 'Congestion', 'Other'].map(option => (
                        <label key={option} className="exam-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.nose_throat_findings || []).includes(option)}
                            onChange={(e) => handleCheckboxChange('nose_throat_findings', option, e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skin & Coat */}
                  <div className="exam-card">
                    <label className="exam-card-title">🦴 Skin & Coat</label>
                    <div className="exam-options">
                      {['Hair Loss', 'Hot Spot', 'Red Skin', 'Flakiness', 'Other'].map(option => (
                        <label key={option} className="exam-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.skin_coat_findings || []).includes(option)}
                            onChange={(e) => handleCheckboxChange('skin_coat_findings', option, e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lymph Nodes */}
                  <div className="exam-card">
                    <label className="exam-card-title">🔬 Lymph Nodes</label>
                    <div className="exam-options">
                      {['Normal', 'Enlarged', 'Painful'].map(option => (
                        <label key={option} className="exam-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.lymph_nodes_findings || []).includes(option)}
                            onChange={(e) => handleCheckboxChange('lymph_nodes_findings', option, e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Abdomen */}
                  <div className="exam-card">
                    <label className="exam-card-title">🫁 Abdomen</label>
                    <div className="exam-options">
                      {['Soft', 'Painful', 'Masses'].map(option => (
                        <label key={option} className="exam-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.abdomen_findings || []).includes(option)}
                            onChange={(e) => handleCheckboxChange('abdomen_findings', option, e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Musculoskeletal */}
                  <div className="exam-card">
                    <label className="exam-card-title">🦴 Musculoskeletal / Gait</label>
                    <div className="exam-options">
                      {['Normal', 'Lameness', 'Stiffness', 'Other'].map(option => (
                        <label key={option} className="exam-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.musculoskeletal_findings || []).includes(option)}
                            onChange={(e) => handleCheckboxChange('musculoskeletal_findings', option, e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Oral / Dental */}
                  <div className="exam-card">
                    <label className="exam-card-title">🦷 Oral / Dental</label>
                    <div className="exam-options">
                      {['Plaque', 'Tartar', 'Lesions', 'Other'].map(option => (
                        <label key={option} className="exam-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.oral_dental_findings || []).includes(option)}
                            onChange={(e) => handleCheckboxChange('oral_dental_findings', option, e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Neurological */}
                  <div className="exam-card">
                    <label className="exam-card-title">🧠 Neurological</label>
                    <div className="exam-options">
                      {['Normal', 'Abnormal Reflexes', 'Incoordination', 'Other'].map(option => (
                        <label key={option} className="exam-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.neurological_findings || []).includes(option)}
                            onChange={(e) => handleCheckboxChange('neurological_findings', option, e.target.checked)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Exam Notes</label>
                <textarea
                  value={formData.exam_notes || ''}
                  onChange={(e) => handleFieldChange('exam_notes', e.target.value)}
                  rows={3}
                  className="form-textarea"
                  placeholder="Enter any additional observations or notes..."
                />
              </div>
            </div>
          </div>

          {/* Diagnosis / Assessment */}
          <div className="section section-white">
            <h3 className="section-title">
              <div className="section-indicator section-indicator-orange"></div>
              Diagnosis / Assessment
            </h3>
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">Primary Diagnosis</label>
                <input
                  type="text"
                  value={formData.primary_diagnosis || ''}
                  onChange={(e) => handleFieldChange('primary_diagnosis', e.target.value)}
                  placeholder="Enter primary diagnosis"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Secondary / Differential Diagnosis</label>
                <input
                  type="text"
                  value={formData.secondary_diagnosis || ''}
                  onChange={(e) => handleFieldChange('secondary_diagnosis', e.target.value)}
                  placeholder="Enter additional or differential diagnoses"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Severity / Status</label>
                <select
                  value={formData.severity || ''}
                  onChange={(e) => handleFieldChange('severity', e.target.value)}
                  className="form-input"
                >
                  <option value="">Select severity</option>
                  {['Mild', 'Moderate', 'Severe', 'Acute', 'Chronic'].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Treatment / Prescription */}
          <div className="section section-white">
            <h3 className="section-title">
              <div className="section-indicator section-indicator-red"></div>
              Treatment / Prescription
            </h3>
            <div className="form-section-lg">
              <div className="form-group">
                <div className="medications-header">
                  <label className="form-label">Medications Prescribed</label>
                  <button onClick={addMedication} className="add-button">
                    <Plus className="icon-sm" />
                    Add Medication
                  </button>
                </div>
                <div className="table-container">
                  <div className="table-scroll">
                    <table className="medications-table">
                      <thead>
                        <tr>
                          <th>Drug Name</th>
                          <th>Dose</th>
                          <th>Route</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Notes</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {medications.map((med, index) => (
                          <tr key={med.id}>
                            <td>
                              <input
                                type="text"
                                placeholder="Drug name"
                                className="table-input"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Dose"
                                className="table-input"
                              />
                            </td>
                            <td>
                              <select className="table-input">
                                <option value="">Select</option>
                                {['Oral', 'Injection', 'Topical'].map(route => (
                                  <option key={route} value={route}>{route}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select className="table-input">
                                <option value="">Select</option>
                                {['Once Daily', 'Twice Daily', 'Thrice Daily', 'As Needed'].map(freq => (
                                  <option key={freq} value={freq}>{freq}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Duration"
                                className="table-input"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                placeholder="Notes"
                                className="table-input"
                              />
                            </td>
                            <td>
                              {medications.length > 1 && (
                                <button
                                  onClick={() => removeMedication(med.id)}
                                  className="delete-button"
                                >
                                  <Trash2 className="icon-sm" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="procedures-box">
                <label className="procedures-title">Procedures Performed</label>
                <div className="checkbox-grid-procedures">
                  {['Vaccination', 'Deworming', 'Wound Care', 'Surgery', 'Grooming'].map(option => (
                    <label key={option} className="checkbox-label procedures-checkbox">
                      <input
                        type="checkbox"
                        checked={(formData.procedures || []).includes(option)}
                        onChange={(e) => handleCheckboxChange('procedures', option, e.target.checked)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Instructions</label>
                <textarea
                  value={formData.follow_up_instructions || ''}
                  onChange={(e) => handleFieldChange('follow_up_instructions', e.target.value)}
                  rows={3}
                  placeholder="Enter follow-up care instructions for the owner..."
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* Lab / Diagnostics Ordered */}
          <div className="section section-white">
            <h3 className="section-title">
              <div className="section-indicator section-indicator-indigo"></div>
              Lab / Diagnostics Ordered
            </h3>
            <div className="form-section">
              <div className="tests-box">
                <label className="tests-title">Tests Ordered</label>
                <div className="checkbox-grid-tests">
                  {['Blood Test', 'Urinalysis', 'Fecal Test', 'X-Ray', 'Ultrasound', 'MRI', 'Biopsy'].map(option => (
                    <label key={option} className="checkbox-label tests-checkbox">
                      <input
                        type="checkbox"
                        checked={(formData.tests_ordered || []).includes(option)}
                        onChange={(e) => handleCheckboxChange('tests_ordered', option, e.target.checked)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Results / Attachments</label>
                <div className="upload-box">
                  <Upload className="upload-icon" />
                  <p className="upload-text">Click to upload or drag and drop</p>
                  <p className="upload-subtext">PDF, Images, or Documents</p>
                  <input type="file" className="upload-input" multiple />
                </div>
              </div>
            </div>
          </div>

          {/* Lifestyle / Environmental Notes */}
          <div className="section section-white">
            <h3 className="section-title">
              <div className="section-indicator section-indicator-teal"></div>
              Lifestyle / Environmental Notes
            </h3>
            <div className="form-section">
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Diet Changes / New Food</label>
                  <input
                    type="text"
                    value={formData.diet_change || ''}
                    onChange={(e) => handleFieldChange('diet_change', e.target.value)}
                    placeholder="Any recent diet changes..."
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Exercise / Activity Level</label>
                  <select
                    value={formData.activity_level || ''}
                    onChange={(e) => handleFieldChange('activity_level', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select</option>
                    {['Low', 'Medium', 'High'].map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div className="checkbox-container">
                  <label className="single-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.contact_with_other_animals || false}
                      onChange={(e) => handleFieldChange('contact_with_other_animals', e.target.checked)}
                      className="checkbox-input"
                    />
                    <span>Contact with Other Animals</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Water Source</label>
                  <select
                    value={formData.water_source || ''}
                    onChange={(e) => handleFieldChange('water_source', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select</option>
                    {['Clean', 'Unclean', 'Bottled', 'Tap'].map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Grooming / Hygiene</label>
                <input
                  type="text"
                  value={formData.grooming_notes || ''}
                  onChange={(e) => handleFieldChange('grooming_notes', e.target.value)}
                  placeholder="Notes on grooming and hygiene..."
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Summary / Visit Notes */}
          <div className="section section-white">
            <h3 className="section-title">
              <div className="section-indicator section-indicator-gray"></div>
              Summary / Visit Notes
            </h3>
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">Free-Text Notes</label>
                <textarea
                  value={formData.visit_notes || ''}
                  onChange={(e) => handleFieldChange('visit_notes', e.target.value)}
                  rows={4}
                  placeholder="Enter general visit notes..."
                  className="form-textarea"
                />
              </div>
              <div className="form-group">
                <label className="form-label">SOAP Notes</label>
                <textarea
                  value={formData.soap_notes || ''}
                  onChange={(e) => handleFieldChange('soap_notes', e.target.value)}
                  rows={4}
                  placeholder="Subjective, Objective, Assessment, Plan"
                  className="form-textarea"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Instructions / Handouts</label>
                <div className="upload-box">
                  <Upload className="upload-icon" />
                  <p className="upload-text">Upload handouts or instructions</p>
                  <p className="upload-subtext">PDF or Document files</p>
                  <input type="file" className="upload-input" multiple />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('Form data:', formData);
              onClose();
            }}
            className="save-button"
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewRecordModal;