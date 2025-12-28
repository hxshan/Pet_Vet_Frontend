import React, { useState } from 'react';
import SearchDropdown from '../components/SearchDropdown.jsx';

const PetSearchPage = ({ navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelect = (pet) => {
    setSearchTerm(`${pet.id} - ${pet.name}`);
    navigate('/medical-record', { state: { pet } });
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Veterinary Medical Records</h1>
        <p>Search for a pet to create a new medical record</p>
      </div>
      
      <SearchDropdown
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onSelect={handleSelect}
      />
    </div>
  );
};

// Page: MedicalRecordPage
const MedicalRecordPage = ({ navigate, pet }) => {
  const [formData, setFormData] = useState({
    visitDate: '',
    symptoms: '',
    diagnosis: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    routeOfAdministration: '',
    refillsAllowed: 0,
    specialInstructions: '',
    treatmentNotes: '',
    followUpRequired: false
  });

  if (!pet) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (!formData.visitDate || !formData.symptoms || !formData.diagnosis) {
      alert('Please fill in all required fields (Visit Date, Symptoms, Diagnosis)');
      return;
    }
    const record = {
      ...pet,
      ...formData,
      submittedAt: new Date().toISOString()
    };
    console.log('Medical record submitted:', record);
    alert('Medical record submitted successfully!');
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <button type="button" onClick={handleBack} className="back-btn">← Back to Search</button>
        <h1>New Medical Record</h1>
      </div>

      <div className="form-wrapper">
        <PetInfoSection pet={pet} />
        <VisitDetailsSection formData={formData} onChange={handleChange} />
        <PrescriptionSection formData={formData} onChange={handleChange} />
        <AdditionalInfoSection formData={formData} onChange={handleChange} />

        <div className="form-actions">
          <button type="button" onClick={handleBack} className="btn-secondary">Cancel</button>
          <button type="button" onClick={handleSubmit} className="btn-primary">Submit Record</button>
        </div>
      </div>
    </div>
  );
};

export default PetSearchPage