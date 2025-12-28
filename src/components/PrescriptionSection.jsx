import React from 'react'

const PrescriptionSection = ({ formData, onChange }) => {
  return (
    <section className="form-section">
      <h2>Prescription</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="medicationName">Medication Name</label>
          <input
            id="medicationName"
            type="text"
            name="medicationName"
            value={formData.medicationName}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="dosage">Dosage</label>
          <input
            id="dosage"
            type="text"
            name="dosage"
            value={formData.dosage}
            onChange={onChange}
            placeholder="e.g., 10mg"
          />
        </div>
        <div className="form-group">
          <label htmlFor="frequency">Frequency</label>
          <input
            id="frequency"
            type="text"
            name="frequency"
            value={formData.frequency}
            onChange={onChange}
            placeholder="e.g., Twice daily"
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration</label>
          <input
            id="duration"
            type="text"
            name="duration"
            value={formData.duration}
            onChange={onChange}
            placeholder="e.g., 7 days"
          />
        </div>
        <div className="form-group">
          <label htmlFor="routeOfAdministration">Route of Administration</label>
          <select
            id="routeOfAdministration"
            name="routeOfAdministration"
            value={formData.routeOfAdministration}
            onChange={onChange}
          >
            <option value="">Select route</option>
            <option value="Oral">Oral</option>
            <option value="Topical">Topical</option>
            <option value="Injection">Injection</option>
            <option value="Intravenous">Intravenous</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="refillsAllowed">Refills Allowed</label>
          <input
            id="refillsAllowed"
            type="number"
            name="refillsAllowed"
            value={formData.refillsAllowed}
            onChange={onChange}
            min="0"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="specialInstructions">Special Instructions</label>
        <textarea
          id="specialInstructions"
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={onChange}
          rows="3"
        />
      </div>
    </section>
  );
};

export default PrescriptionSection