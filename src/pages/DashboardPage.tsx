import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const DashboardPage = () => {
    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="main-content">
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1>Dashboard</h1>
                    <p>Welcome to your Dashboard.</p>
                    <p style={{ color: '#666', marginTop: '20px' }}>
                        Create a Trip, View Stats, or Manage your bookings here.
                        <br/>
                        (Coming Soon)
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardPage;
