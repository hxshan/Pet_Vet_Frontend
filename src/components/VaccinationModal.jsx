import { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import '../assets/styles/vaccinationModal.css';

// Mock pet data
const mockPets = [
  { id: 'PET001', name: 'Max', species: 'Dog', breed: 'Golden Retriever', owner: { name: 'John Smith', phone: '555-0101', email: 'john@example.com' } },
  { id: 'PET002', name: 'Luna', species: 'Cat', breed: 'Persian', owner: { name: 'Emily Davis', phone: '555-0102', email: 'emily@example.com' } },
  { id: 'PET003', name: 'Charlie', species: 'Dog', breed: 'Beagle', owner: { name: 'Michael Brown', phone: '555-0103', email: 'michael@example.com' } },
  { id: 'PET004', name: 'Bella', species: 'Dog', breed: 'Labrador', owner: { name: 'Sarah Wilson', phone: '555-0104', email: 'sarah@example.com' } },
  { id: 'PET005', name: 'Whiskers', species: 'Cat', breed: 'Maine Coon', owner: { name: 'David Martinez', phone: '555-0105', email: 'david@example.com' } },
];

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export function VaccinationModal({ isOpen, onClose }) {
  const [petSearch, setPetSearch] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetDropdown, setShowPetDropdown] = useState(false);
  const [formData, setFormData] = useState({
    route: 'Subcutaneous',
    administeredDate: getTodayDate(),
    veterinarian: 'Dr. Sarah Johnson',
  });
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
      pet: pet.id,
    });
  };

  const handleFieldChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    console.log('Vaccination data:', formData);
    onClose();
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
              {/* Pet Searchable Dropdown */}
              <div ref={dropdownRef} className="vaccination-pet-dropdown-container">
                <label className="vaccination-form-label">Pet *</label>
                <div className="vaccination-search-input-wrapper">
                  <Search className="vaccination-search-icon" />
                  <input
                    type="text"
                    value={petSearch}
                    onChange={(e) => {
                      setPetSearch(e.target.value);
                      setShowPetDropdown(true);
                    }}
                    onFocus={() => setShowPetDropdown(true)}
                    placeholder="Select pet"
                    className="vaccination-search-input"
                  />
                </div>
                {showPetDropdown && (
                  <div className="vaccination-pet-dropdown">
                    {filteredPets.length > 0 ? (
                      filteredPets.map(pet => (
                        <button
                          key={pet.id}
                          onClick={() => handlePetSelect(pet)}
                          className="vaccination-pet-dropdown-item"
                        >
                          <div className="vaccination-pet-dropdown-name">{pet.id} - {pet.name}</div>
                          <div className="vaccination-pet-dropdown-details">{pet.species} ({pet.breed}) - Owner: {pet.owner.name}</div>
                        </button>
                      ))
                    ) : (
                      <div className="vaccination-pet-dropdown-empty">No pets found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Vaccine Name */}
              <div>
                <label className="vaccination-form-label">Vaccine Name *</label>
                <select
                  value={formData.vaccineName || ''}
                  onChange={(e) => handleFieldChange('vaccineName', e.target.value)}
                  className="vaccination-form-select"
                >
                  <option value="">Select vaccine</option>
                  {['Rabies', 'Distemper', 'Parvovirus', 'Hepatitis', 'Leptospirosis', 'Other'].map(vaccine => (
                    <option key={vaccine} value={vaccine}>{vaccine}</option>
                  ))}
                </select>
              </div>

              {/* Manufacturer / Batch Number */}
              <div>
                <label className="vaccination-form-label">Manufacturer / Batch Number</label>
                <input
                  type="text"
                  value={formData.manufacturer || ''}
                  onChange={(e) => handleFieldChange('manufacturer', e.target.value)}
                  placeholder="Enter batch number or manufacturer"
                  className="vaccination-form-input"
                />
              </div>

              {/* Dose and Route */}
              <div className="vaccination-grid vaccination-grid-md-2">
                <div>
                  <label className="vaccination-form-label">Dose *</label>
                  <input
                    type="text"
                    value={formData.dose || ''}
                    onChange={(e) => handleFieldChange('dose', e.target.value)}
                    placeholder="e.g., 1 ml or 0.5 mg/kg"
                    className="vaccination-form-input"
                  />
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
          <button onClick={handleSubmit} className="vaccination-save-btn">
            Save Vaccination Record
          </button>
        </div>
      </div>
    </div>
  );
}
