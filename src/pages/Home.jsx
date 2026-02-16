import React from 'react';
import '../assets/styles/landing.css';

const Home = ({ navigate }) => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="brand">PetCare Suite</div>
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Log in</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay">
          <h1 className="hero-title">A complete platform for vets, pet owners and adoption centers</h1>
          <p className="hero-sub">Manage appointments, medical records, vaccinations and adoption workflows — all in one place.</p>

          <div className="hero-cta">
            <button className="btn primary" onClick={() => navigate('/signup', { state: { role: 'veterinarian' } })}>Register as Veterinarian</button>
            <button className="btn outline" onClick={() => navigate('/signup', { state: { role: 'pet_owner' } })}>Register as Pet Owner</button>
            <button className="btn outline" onClick={() => navigate('/signup', { state: { role: 'adoption_center' } })}>Register Adoption Center</button>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="info-inner">
          <h2>Built for every role</h2>
          <div className="cards">
            <div className="card">
              <h3>Veterinarians</h3>
              <p>Quick access to patient histories, vaccination scheduling, and streamlined appointment management.</p>
            </div>
            <div className="card">
              <h3>Pet Owners</h3>
              <p>Keep your pet's records, vaccinations and appointments in one secure place. Receive reminders for follow-ups.</p>
            </div>
            <div className="card">
              <h3>Adoption Centers</h3>
              <p>Manage animals, volunteers and adoption workflows. Connect pets with loving homes faster.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <small>© {new Date().getFullYear()} PetCare Suite</small>
      </footer>
    </div>
  );
};

export default Home;
