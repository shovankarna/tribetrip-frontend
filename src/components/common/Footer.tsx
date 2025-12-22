import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer-common">
            <div className="footer-content">
                <div className="footer-col">
                    <h3>TripTribe</h3>
                    <p>Plan better. Travel together.</p>
                </div>
                <div className="footer-col">
                    <h4>Product</h4>
                    <a href="#">Features</a>
                    <a href="#">Pricing</a>
                </div>
                <div className="footer-col">
                    <h4>Company</h4>
                    <a href="#">About</a>
                    <a href="#">Contact</a>
                </div>
                 <div className="footer-col">
                    <h4>Legal</h4>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} TripTribe. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
