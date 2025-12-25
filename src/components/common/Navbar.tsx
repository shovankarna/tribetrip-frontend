import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import keycloak from '../../auth';
import Button from './Button';
import './Navbar.css';

interface NavbarProps {
    transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile drawer when route changes
    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    const isLanding = location.pathname === '/';
    const isTransparent = transparent && !scrolled && isLanding && !mobileOpen;

    const navLinks = (
        <>
            {keycloak.authenticated ? (
                <>
                     <a onClick={() => navigate('/trips')}>My Trips</a>
                     {/* <a onClick={() => navigate('/explore')}>Explore</a> */}
                </>
            ) : (
                isLanding && (
                    <>
                        <a href="#explore" onClick={() => setMobileOpen(false)}>Explore</a>
                        <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
                        <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
                    </>
                )
            )}
        </>
    );

    return (
        <header className={`navbar-common ${isTransparent ? 'transparent' : 'solid'}`}>
            <div className="navbar-content">
                <div className="logo" onClick={() => navigate('/')}>
                    TripTribe
                </div>

                {/* Desktop Navigation */}
                <nav className="nav-links-center">
                    {navLinks}
                </nav>

                {/* Desktop Actions */}
                <div className="nav-actions-right">
                    {keycloak.authenticated ? (
                        <>
                            <span className="user-greeting">
                                Hi, {keycloak.tokenParsed?.given_name || "Traveler"}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                                Profile
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => keycloak.logout()}
                            >
                                Logout
                            </Button>
                            {location.pathname !== '/dashboard' && (
                                <Button size="sm" onClick={() => navigate('/dashboard')}>
                                    Dashboard
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => keycloak.login()}>
                            Sign In
                        </Button>
                    )}
                </div>

                {/* Hamburger Icon */}
                <button 
                    className={`hamburger ${mobileOpen ? 'open' : ''}`} 
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    <div />
                    <div />
                    <div />
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            <div 
                className={`mobile-overlay ${mobileOpen ? 'open' : ''}`} 
                onClick={() => setMobileOpen(false)}
            />

            {/* Mobile Side Drawer */}
            <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
                <nav>
                    {navLinks}
                    {keycloak.authenticated && (
                        <>
                             <a onClick={() => navigate('/profile')}>Profile</a>
                             {location.pathname !== '/dashboard' && (
                                <a onClick={() => navigate('/dashboard')}>Dashboard</a>
                             )}
                        </>
                    )}
                </nav>
                
                <div className="mobile-actions">
                    {keycloak.authenticated ? (
                         <Button 
                            variant="primary" 
                            size="md"
                            onClick={() => keycloak.logout()}
                            style={{width: '100%'}}
                        >
                            Logout
                        </Button>
                    ) : (
                        <Button 
                            variant="primary" 
                            size="md" 
                            onClick={() => keycloak.login()}
                            style={{width: '100%'}}
                        >
                            Sign In
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
