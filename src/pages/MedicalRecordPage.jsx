import React from 'react'
import { useState } from 'react'
import PetInfoSection from '../components/PetInfoSection'
import VisitDetailsSection from '../components/VisitDetailsSection'
import PrescriptionSection from '../components/PrescriptionSection'
import AdditionalInfoSection from '../components/AdditionalInfoSection'

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
    navigate('/dashboard');
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

export default MedicalRecordPage