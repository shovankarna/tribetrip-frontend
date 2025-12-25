import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { TripService } from '../services/TripService';
import type { Trip, CreateTripRequest } from '../services/TripService';
import './TripsPage.css';

// --- Icons ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
);
const MoreHIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
);

const TripsPage = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // New Trip Form State
    const [newTrip, setNewTrip] = useState<CreateTripRequest>({
        name: '',
        destination: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            setLoading(true);
            const data = await TripService.getUserTrips();
            setTrips(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const createdTrip = await TripService.createTrip(newTrip);
            setShowCreateModal(false);
            toast.success("Trip created successfully!");
            navigate(`/trips/${createdTrip.id}`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to create trip');
        }
    };

    // Filter Logic
    const filteredTrips = trips.filter(trip => {
        const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (trip.destination && trip.destination.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const now = new Date().toISOString().split('T')[0];
        const isPast = trip.endDate && trip.endDate < now;
        
        if (activeTab === 'upcoming') return matchesSearch && !isPast;
        if (activeTab === 'past') return matchesSearch && isPast;
        return matchesSearch;
    });

    return (
        <div className="trips-page-container">
            <Navbar />
            
            <div className="trips-content-wrapper">
                
                {/* 1. Header Row */}
                <div className="trips-page-header">
                    <h1 className="trips-title">My Trips</h1>
                    {/* Outline button style matching image */}
                    <button 
                        className="cta-button-large" 
                        style={{padding: '0.6rem 1.2rem', fontSize: '0.9rem'}}
                        onClick={() => setShowCreateModal(true)}
                    >
                        Start a new adventure
                    </button>
                </div>

                {/* 2. Toolbar Row */}
                <div className="trips-toolbar">
                    <div className="trips-tabs">
                        <button 
                            className={`trip-tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Trips
                        </button>
                        <button 
                            className={`trip-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button 
                            className={`trip-tab ${activeTab === 'past' ? 'active' : ''}`}
                            onClick={() => setActiveTab('past')}
                        >
                            Past
                        </button>
                    </div>

                    <div className="trips-search-group">
                        <div className="search-field-wrapper">
                            <span className="search-field-icon"><SearchIcon /></span>
                            <input 
                                type="text" 
                                className="search-field"
                                placeholder="Search trips..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="filter-button">
                            <FilterIcon />
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="trips-divider"></div>

                {/* 3. Content */}
                {loading ? (
                    <div style={{opacity: 0.6}}>Loading your adventures...</div>
                ) : filteredTrips.length === 0 ? (
                    /* Empty State View */
                    <div className="empty-state-view">
                        <img 
                            src="/assets/illustrations/empty-state.png" 
                            alt="No trips yet" 
                            className="empty-state-illustration"
                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                        />
                        <h2 className="empty-state-headline">You have no trips yet.</h2>
                        <p className="empty-state-subtext">
                            Create your first trip to start your adventure.
                        </p>
                        <button className="cta-button-large" onClick={() => setShowCreateModal(true)}>
                            Create Trip
                        </button>
                    </div>
                ) : (
                    /* Grid View */
                    <div className="trips-grid-view">
                        {filteredTrips.map(trip => (
                            <div 
                                key={trip.id} 
                                className="t-card"
                                onClick={() => navigate(`/trips/${trip.id}`)}
                            >
                                <img 
                                    src={`https://source.unsplash.com/800x400/?travel,${trip.destination || 'nature'}`} 
                                    alt={trip.name}
                                    className="t-card-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://source.unsplash.com/800x400/?laptop';
                                    }}
                                />
                                <div className="t-card-body">
                                    <div className="t-card-header">
                                        <h3 className="t-card-title">{trip.name}</h3>
                                        <div style={{color: '#888'}}><MoreHIcon /></div>
                                    </div>
                                    {trip.destination && (
                                        <div className="t-card-meta">
                                            📍 {trip.destination}
                                        </div>
                                    )}
                                    {(trip.startDate || trip.endDate) && (
                                        <div className="t-card-meta">
                                            📅 {trip.startDate} - {trip.endDate}
                                        </div>
                                    )}
                                    <div className="t-card-footer">
                                        <button className="icon-btn-text">View Trip</button>
                                        <button className="icon-btn-text" onClick={(e) => e.stopPropagation()}>Share</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-backdrop" style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                    <div style={{background: '#1E1E1E', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid #333'}}>
                         <h2 style={{marginTop: 0, color: 'white'}}>Start a New Trip</h2>
                         <form onSubmit={handleCreateTrip} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                            <div>
                                <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Trip Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newTrip.name}
                                    onChange={e => setNewTrip({...newTrip, name: e.target.value})}
                                    style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                />
                            </div>
                            <div>
                                <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Destination</label>
                                <input 
                                    type="text" 
                                    value={newTrip.destination || ''}
                                    onChange={e => setNewTrip({...newTrip, destination: e.target.value})}
                                    style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                />
                            </div>
                            <div style={{display: 'flex', gap: '1rem'}}>
                                <div style={{flex: 1}}>
                                    <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Start Date</label>
                                    <input 
                                        type="date" 
                                        value={newTrip.startDate || ''}
                                        onChange={e => setNewTrip({...newTrip, startDate: e.target.value})}
                                        style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                    />
                                </div>
                                <div style={{flex: 1}}>
                                    <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>End Date</label>
                                    <input 
                                        type="date" 
                                        value={newTrip.endDate || ''}
                                        onChange={e => setNewTrip({...newTrip, endDate: e.target.value})}
                                        style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                    />
                                </div>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{background: 'transparent', border: '1px solid #444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer'}}>Cancel</button>
                                <button type="submit" style={{background: 'white', border: 'none', color: 'black', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'}}>Create Trip</button>
                            </div>
                         </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripsPage;
