import React from 'react'

const PetInfoSection = ({ pet }) => {
  return (
    <section className="form-section">
      <h2>Pet Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Pet ID</label>
          <input type="text" value={pet.id} disabled />
        </div>
        <div className="form-group">
          <label>Pet Name</label>
          <input type="text" value={pet.name} disabled />
        </div>
        <div className="form-group">
          <label>Species</label>
          <input type="text" value={pet.species} disabled />
        </div>
        <div className="form-group">
          <label>Breed</label>
          <input type="text" value={pet.breed} disabled />
        </div>
        <div className="form-group full-width">
          <label>Owner Name</label>
          <input type="text" value={pet.owner} disabled />
        </div>
      </div>
    </section>
  );
};

export default PetInfoSection