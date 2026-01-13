import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { TripService } from '../services/TripService';
import type { Trip } from '../services/TripService';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ExpensesPage = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            const userTrips = await TripService.getUserTrips();
            setTrips(userTrips);
        } catch (error) {
            console.error("Failed to load trips", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{minHeight: '100vh', background: '#121212', color: 'white', display: 'flex', flexDirection: 'column'}}>
            <Navbar />
            <div style={{maxWidth: '1000px', margin: '0 auto', width: '90%', padding: '2rem 0', paddingTop: '100px', flex: 1}}>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '2rem'}}>
                    <div style={{fontSize: '3rem', marginRight: '1rem'}}>💸</div>
                    <div>
                        <h1 style={{margin: 0}}>Your Expenses</h1>
                        <p style={{color: '#aaa', margin: 0}}>Select a trip to view and manage expenses.</p>
                    </div>
                </div>

                {loading ? (
                    <div>Loading trips...</div>
                ) : trips.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '4rem', background: '#1E1E1E', borderRadius: '12px'}}>
                        <h3>No trips found</h3>
                        <p style={{color: '#aaa'}}>You haven't joined any trips yet.</p>
                        <button 
                            onClick={() => navigate('/trips')}
                            style={{marginTop: '1rem', background: '#3D5AFE', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer'}}
                        >
                            Go to My Trips
                        </button>
                    </div>
                ) : (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem'}}>
                        {trips.map(trip => (
                            <div 
                                key={trip.id}
                                onClick={() => navigate(`/trips/${trip.id}/expenses`)}
                                style={{
                                    background: '#1E1E1E', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333',
                                    cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.borderColor = '#3D5AFE';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = '#333';
                                }}
                            >
                                <h3 style={{marginTop: 0, marginBottom: '0.5rem'}}>{trip.name}</h3>
                                <p style={{color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem'}}>
                                    {trip.destination || 'Unknown Destination'} • {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'Date TBD'}
                                </p>
                                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                    <span style={{color: '#3D5AFE', fontWeight: 600}}>View Expenses →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ExpensesPage;
