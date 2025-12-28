import React from 'react'

const VisitDetailsSection = ({ formData, onChange }) => {
  return (
    <section className="form-section">
      <h2>Visit Details</h2>
      <div className="form-group">
        <label htmlFor="visitDate">Visit Date *</label>
        <input
          id="visitDate"
          type="date"
          name="visitDate"
          value={formData.visitDate}
          onChange={onChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="symptoms">Symptoms *</label>
        <textarea
          id="symptoms"
          name="symptoms"
          value={formData.symptoms}
          onChange={onChange}
          rows="4"
        />
      </div>
      <div className="form-group">
        <label htmlFor="diagnosis">Diagnosis *</label>
        <textarea
          id="diagnosis"
          name="diagnosis"
          value={formData.diagnosis}
          onChange={onChange}
          rows="4"
        />
      </div>
    </section>
  );
};
export default VisitDetailsSection