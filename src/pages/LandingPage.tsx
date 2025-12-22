import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import keycloak from '../auth';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
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
            <Button variant="outline" size="lg">Explore Trips</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
