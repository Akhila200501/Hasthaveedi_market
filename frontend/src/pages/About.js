import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AboutPage.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* Hero Section */}
      <header className="hero-section">
        <img
          src="/images/about_hero.png"
          alt="Artisans at work"
          className="hero-bg"
        />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>About HasthaVeedhi</h1>
          <p>
            Bridging the gap between India's finest artisans and global craft enthusiasts.
            Authentic, handmade, and ethically sourced.
          </p>
          <button className="btn-premium" onClick={() => navigate('/map')}>
            Explore the Craft Map
          </button>
        </div>
      </header>

      {/* Main Content */}
      <section className="about-section">
        <div className="about-grid">
          <div className="section-text">
            <h2>Who we are</h2>
            <p>
              HasthaVeedhi is a heart-crafted marketplace designed to help you discover the
              soul of India. From handwoven textiles to traditional pottery, we bring you
              authentic stories from every corner of the country.
            </p>
            <p>
              Our platform empowers local communities by providing a transparent revenue channel,
              ensuring that every purchase supports a sustainable artisan livelihood.
            </p>
          </div>
          <div className="section-image">
            <img src="/images/textiles.png" alt="Handicrafts" />
          </div>
        </div>
      </section>

      <section className="about-section" style={{ backgroundColor: '#fff', padding: '5rem 10%' }}>
        <div className="about-grid" style={{ gridDirection: 'rtl' }}>
          <div className="section-image" style={{ order: 1 }}>
            <img src="/images/pottery.png" alt="Pottery tools" />
          </div>
          <div className="section-text" style={{ order: 2 }}>
            <h2>What we do</h2>
            <ul className="feature-list">
              <li>Locate regional craft clusters on our interactive map.</li>
              <li>Browse and order authentic artisan products directly.</li>
              <li>Manage deliveries and orders with complete transparency.</li>
              <li>Get curated suggestions with our AI-powered Gift Assistant.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="gallery-section">
        <h2>Our Colourful Craft Gallery</h2>
        <div className="about-gallery">
          <div className="about-card">
            <img src="/images/textiles.png" alt="Textile" />
            <span>Handwoven Textiles</span>
          </div>
          <div className="about-card">
            <img src="/images/pottery.png" alt="Pottery" />
            <span>Clay Pottery</span>
          </div>
          <div className="about-card">
            <img src="/images/jewellery.png" alt="Jewellery" />
            <span>Traditional Jewellery</span>
          </div>
        </div>
      </section>

      <footer style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#2c3e50', color: 'white' }}>
        <p>&copy; 2026 HasthaVeedhi - Supporting Indian Artisans</p>
        <button className="btn-premium" style={{ marginTop: '1rem', background: 'transparent', border: '1px solid white' }} onClick={() => navigate('/')}>
          Back to Home
        </button>
      </footer>
    </div>
  );
};

export default About;
