import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import keycloak from '../auth';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Footer from '../components/common/Footer';
import './LandingPage.css';

const images = [
  '/images/hero-carousel/hero-1.png',
  '/images/hero-carousel/hero-2.png',
  '/images/hero-carousel/hero-3.png',
  '/images/hero-carousel/hero-4.png',
  '/images/hero-carousel/hero-5.png'
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
     const interval = setInterval(() => {
         setCurrentImageIndex(prev => (prev + 1) % images.length);
     }, 5000);
     return () => clearInterval(interval);
  }, []);

  const handleRegister = () => {
    keycloak.register();
  };

  const handleExplore = () => {
    const element = document.getElementById('explore');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* Background Image Layer - Carousel */}
      {images.map((img, index) => (
          <div 
            key={index}
            className={`landing-background ${index === currentImageIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url('${img}')` }}
          ></div>
      ))}
      <div className="landing-overlay"></div>

      <Navbar transparent />

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Plan trips. Travel better.<br />
            <span className="text-highlight">Together.</span>
          </h1>
          <p className="hero-subtitle">
            Create trips, organize plans, and travel with clarity.<br />
            No chaos. No clutter.
          </p>
          
          <div className="cta-group">
            {keycloak.authenticated ? (
                <Button size="lg" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
            ) : (
                <Button size="lg" onClick={handleRegister}>
                  Start a Trip
                </Button>
            )}
            <Button variant="outline" size="lg" onClick={handleExplore}>Explore Trips</Button>
          </div>
        </div>
      </main>
      {/* Features Section */}
      <section id="features" className="features-section">
          <div className="section-container">
              <h2>Everything you need for the perfect trip</h2>
              <div className="features-grid">
                  <div className="feature-card">
                      <div className="feature-icon">📅</div>
                      <h3>Smart Itineraries</h3>
                      <p>Build detailed day-by-day plans with ease. Drag, drop, and organize your activities.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">💰</div>
                      <h3>Expense Tracking</h3>
                      <p>Keep track of every penny. Split bills, settle debts, and manage your travel budget.</p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">🤖</div>
                      <h3>AI Assistant</h3>
                      <p>Get personalized recommendations and automated scheduling from our advanced AI.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="explore-section">
          <div className="section-container">
              <h2>Popular Destinations</h2>
              <p className="section-subtitle">Discover trending places curated by our community</p>
              
              <div className="destinations-grid">
                  <div className="destination-card" style={{backgroundImage: "url('/images/hero-carousel/hero-1.png')"}}>
                      <div className="destination-content">
                          <h3>Paris, France</h3>
                          <span>500+ Itineraries</span>
                      </div>
                  </div>
                  <div className="destination-card" style={{backgroundImage: "url('/images/hero-carousel/hero-2.png')"}}>
                      <div className="destination-content">
                          <h3>Tokyo, Japan</h3>
                          <span>350+ Itineraries</span>
                      </div>
                  </div>
                  <div className="destination-card" style={{backgroundImage: "url('/images/hero-carousel/hero-3.png')"}}>
                      <div className="destination-content">
                          <h3>Bali, Indonesia</h3>
                          <span>420+ Itineraries</span>
                      </div>
                  </div>
                   <div className="destination-card" style={{backgroundImage: "url('/images/hero-carousel/hero-4.png')"}}>
                      <div className="destination-content">
                          <h3>New York, USA</h3>
                          <span>600+ Itineraries</span>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
