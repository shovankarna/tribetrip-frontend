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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isLanding = location.pathname === '/';
    // Navbar is transparent only if prop is true AND not scrolled.
    // However, if we are not on landing, we usually want it solid always.
    const isTransparent = transparent && !scrolled && isLanding;

    return (
        <header className={`navbar-common ${isTransparent ? 'transparent' : 'solid'}`}>
            <div className="navbar-content">
                <div className="logo" onClick={() => navigate('/')}>
                    TripTribe
                </div>

                <nav className="nav-links-center">
                    {/* Different links based on context or Auth? */}
                    {keycloak.authenticated ? (
                        <>
                             <a onClick={() => navigate('/dashboard')}>My Trips</a>
                             {/* <a onClick={() => navigate('/explore')}>Explore</a> */}
                        </>
                    ) : (
                        isLanding && (
                            <>
                                <a href="#explore">Explore</a>
                                <a href="#features">Features</a>
                                <a href="#about">About</a>
                            </>
                        )
                    )}
                </nav>

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
            </div>
        </header>
    );
};

export default Navbar;
