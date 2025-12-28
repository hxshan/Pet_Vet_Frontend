import React from 'react'

const AdditionalInfoSection = ({ formData, onChange }) => {
  return (
    <section className="form-section">
      <h2>Additional Information</h2>
      <div className="form-group">
        <label htmlFor="treatmentNotes">Treatment Notes</label>
        <textarea
          id="treatmentNotes"
          name="treatmentNotes"
          value={formData.treatmentNotes}
          onChange={onChange}
          rows="4"
        />
      </div>
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="followUpRequired"
            checked={formData.followUpRequired}
            onChange={onChange}
          />
          Follow-up Visit Required
        </label>
      </div>
    </section>
  );
};

export default AdditionalInfoSection