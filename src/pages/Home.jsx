import {
  Heart,
  Calendar,
  FileText,
  Home,
  Store,
  User,
  Stethoscope,
  PawPrint,
  Shield,
  Smartphone,
  ArrowRight,
  UserCircle,
  Building2,
  ShoppingBag,
} from "lucide-react";
import "../assets/styles/landing.css";

export default function App({ navigate }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <img
          src="https://images.unsplash.com/photo-1656314943432-b00ec3f6dbce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcmklMjBsYW5rYSUyMGxhbmRzY2FwZSUyMG1vdW50YWluc3xlbnwxfHx8fDE3NzE1MzkyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Sri Lanka landscape"
          className="hero-background"
        />
        <div className="hero-content">
          <h1 className="hero-title">PawConnect Sri Lanka</h1>
          <p className="hero-subtitle">
            Where Every Paw Matters
          </p>
          <p className="hero-description">
            Throughout the entirety of Sri Lanka, connecting pet parents with
            trusted vets, adoption centers, and local stores.
            Your pet's entire medical history,
            appointments, adoption, and shopping lives in one
            intelligent platform.
          </p>
          <div className="hero-buttons">
            <button className="cta-button cta-button-primary">
              <Smartphone size={20} />
              Start Your Journey
            </button>
            <button className="cta-button cta-button-secondary">
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">
            Your Pet's Entire Journey, One Platform
          </h2>
          <p className="section-subtitle">
            Five powerful features working together to
            revolutionize how Sri Lankans care for their pets
          </p>

          <div className="features-list">
            {/* Feature 1: Digital Records */}
            <div className="feature-item">
              <div className="feature-image-container">
                <img
                  src="https://images.unsplash.com/photo-1576765608622-067973a79f53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBtZWRpY2FsJTIwcmVjb3JkJTIwdmFjY2luYXRpb258ZW58MXx8fHwxNzcxNTM5Mjk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Pet medical records"
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <div className="feature-number">01</div>
                <h3 className="feature-title">
                  No More Lost Vaccination Books
                </h3>
                <p className="feature-description">
                  That crumpled paper booklet? It's history.
                  Store rabies shots, deworming schedules, vet
                  visits, and prescriptions in the cloud. Access
                  everything instantly, even if you're visiting
                  a new clinic in Kandy or Jaffna.
                </p>
              </div>
            </div>

            {/* Feature 2: Smart Reminders */}
            <div className="feature-item">
              <div className="feature-image-container">
                <img
                  src="https://images.unsplash.com/photo-1741061961703-0739f3454314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwcGV0JTIwYXBwJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzE1MzkyOTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Pet app technology"
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <div className="feature-number">02</div>
                <h3 className="feature-title">
                  Your Pet's Personal Assistant
                </h3>
                <p className="feature-description">
                  Automated reminders for annual boosters, flea
                  treatments, grooming appointments, and
                  birthday celebrations. Get notified days
                  before—so you're never scrambling at the last
                  minute.
                </p>
              </div>
            </div>

            {/* Feature 3: Vet Integration */}
            <div className="feature-item">
              <div className="feature-image-container">
                <img
                  src="https://images.unsplash.com/photo-1770836037793-95bdbf190f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBleGFtaW5pbmclMjBkb2d8ZW58MXx8fHwxNzcxNTIwMjU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Veterinarian with pet"
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <div className="feature-number">03</div>
                <h3 className="feature-title">
                  Book Vets in Seconds, Not Hours
                </h3>
                <p className="feature-description">
                  Browse available time slots at verified
                  clinics near you—from emergency care to
                  routine checkups. Vets update records directly
                  after each visit, creating a seamless medical
                  timeline for your pet.
                </p>
              </div>
            </div>

            {/* Feature 4: Adoption Centers */}
            <div className="feature-item">
              <div className="feature-image-container">
                <img
                  src="https://images.unsplash.com/photo-1769117329025-d6398d3d6e70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBhZG9wdGlvbiUyMGN1dGUlMjBwdXBweXxlbnwxfHx8fDE3NzE1MzkyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Adoptable pets"
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <div className="feature-number">04</div>
                <h3 className="feature-title">
                  Find Your Next Best Friend
                </h3>
                <p className="feature-description">
                  Meet rescue dogs, cats, rabbits, and more from
                  shelters across the island. Filter by breed,
                  age, and temperament. Read their stories, see
                  their photos, and connect directly with
                  adoption coordinators.
                </p>
              </div>
            </div>

            {/* Feature 5: Pet Stores */}
            <div className="feature-item">
              <div className="feature-image-container">
                <img
                  src="https://images.unsplash.com/photo-1706873251420-caac4330c3b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBzaG9wJTIwYWNjZXNzb3JpZXMlMjB0b3lzfGVufDF8fHx8MTc3MTUzOTMwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Pet store products"
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <div className="feature-number">05</div>
                <h3 className="feature-title">
                  Shop Local, Support Sri Lankan Businesses
                </h3>
                <p className="feature-description">
                  Premium kibble, organic treats, stylish
                  collars, and vet-approved supplements—all from
                  verified local stores. Compare prices, read
                  reviews, and get it delivered or pick up from
                  nearby locations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="features-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Get started in three simple steps
          </p>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Choose Your Role</h3>
              <p className="step-description">
                Register as a pet owner, veterinarian, adoption
                center, or pet store based on your needs.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">
                Create Your Profile
              </h3>
              <p className="step-description">
                Set up your account and add your pet's
                information or business details in minutes.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Start Connecting</h3>
              <p className="step-description">
                Access the complete pet care ecosystem—book
                appointments, shop, adopt, and more!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="registration-section">
        <div className="registration-container">
          <h2 className="registration-title">
            Join PawConnect Today
          </h2>
          <p className="registration-description">
            Select your role to get started and be part of Sri
            Lanka's pet care revolution
          </p>

          <div className="registration-grid">
            <div className="registration-card">
              <div className="registration-icon">
                <UserCircle size={32} />
              </div>
              <h3 className="registration-card-title">
                Pet Parents
              </h3>
              <p className="registration-card-description">
                Your companion's health and happiness, all in
                your pocket
              </p>
              <ul className="registration-card-features">
                <li>Track vaccinations & medical history</li>
                <li>Book vet appointments instantly</li>
                <li>Get personalized pet care tips</li>
                <li>Shop from trusted local stores</li>
              </ul>
              <button className="signup-button" onClick={() => navigate('/login')}>
                Start Free
                <ArrowRight
                  size={18}
                  className="signup-button-icon"
                />
              </button>
            </div>

            <div className="registration-card">
              <div className="registration-icon">
                <Stethoscope size={32} />
              </div>
              <h3 className="registration-card-title">
                Veterinary Clinics
              </h3>
              <p className="registration-card-description">
                Streamline your practice with digital tools
                built for modern vets
              </p>
              <ul className="registration-card-features">
                <li>Manage patient records digitally</li>
                <li>Online appointment scheduling</li>
                <li>Prescription & treatment tracking</li>
                <li>Connect with more pet owners</li>
              </ul>
              <button className="signup-button" onClick={() => navigate('/login')}>
                Join as Clinic
                <ArrowRight
                  size={18}
                  className="signup-button-icon"
                />
              </button>
            </div>

            <div className="registration-card">
              <div className="registration-icon">
                <Building2 size={32} />
              </div>
              <h3 className="registration-card-title">
                Adoption Centers
              </h3>
              <p className="registration-card-description">
                Find loving homes for rescued animals faster
                than ever
              </p>
              <ul className="registration-card-features">
                <li>Showcase adoptable pets online</li>
                <li>Screen potential adopters easily</li>
                <li>Manage adoption applications</li>
                <li>Share success stories</li>
              </ul>
              <button className="signup-button" onClick={() => navigate('/login')}>
                List Your Center
                <ArrowRight
                  size={18}
                  className="signup-button-icon"
                />
              </button>
            </div>

            <div className="registration-card">
              <div className="registration-icon">
                <ShoppingBag size={32} />
              </div>
              <h3 className="registration-card-title">
                Pet Stores
              </h3>
              <p className="registration-card-description">
                Reach thousands of pet owners looking for
                quality supplies
              </p>
              <ul className="registration-card-features">
                <li>Sell products online seamlessly</li>
                <li>Manage inventory & orders</li>
                <li>Offer delivery or pickup options</li>
                <li>Build customer loyalty</li>
              </ul>
              <button className="signup-button" onClick={() => navigate('/login')}>
                Open Your Shop
                <ArrowRight
                  size={18}
                  className="signup-button-icon"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <PawPrint size={24} />
            <p
              className="footer-text"
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              PawConnect Sri Lanka
            </p>
          </div>
          <p className="footer-text">
            Revolutionizing pet care across Sri Lanka
          </p>
          <div className="footer-links">
            <a href="#" className="footer-link">
              About Us
            </a>
            <a href="#" className="footer-link">
              Contact
            </a>
            <a href="#" className="footer-link">
              Privacy Policy
            </a>
            <a href="#" className="footer-link">
              Terms of Service
            </a>
            <a href="#" className="footer-link">
              Help Center
            </a>
          </div>
          <p
            className="footer-text"
            style={{
              marginTop: "20px",
              fontSize: "0.9rem",
              opacity: 0.7,
            }}
          >
            © 2026 PawConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}