import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
// import Button from '../components/common/Button'; // Unused
import keycloak from '../auth';
import './TripDetailPage.css';
import { TripService, type Trip, type TripMember } from '../services/TripService';

// Icons
const CalendarIcon = () => (
    <svg className="td-meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const MapPinIcon = () => (
    <svg className="td-meta-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
// Removed unused UserIcon
const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const TripDetailPage = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();
    
    const [trip, setTrip] = useState<Trip | null>(null);
    const [members, setMembers] = useState<TripMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Member Management
    const [addMemberId, setAddMemberId] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);

    useEffect(() => {
        if (tripId) loadTripData(tripId);
    }, [tripId]);

    const loadTripData = async (id: string) => {
        try {
            setLoading(true);
            const [tripData, membersData] = await Promise.all([
                TripService.getTrip(id),
                TripService.getTripMembers(id)
            ]);
            setTrip(tripData);
            setMembers(membersData);
        } catch (err: any) {
            setError(err.message || 'Failed to load trip details');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tripId || !addMemberId) return;
        try {
            await TripService.addMember(tripId, addMemberId);
            setAddMemberId('');
            setShowAddMember(false);
            loadTripData(tripId);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!tripId || !window.confirm('Remove this member?')) return;
        try {
            await TripService.removeMember(tripId, userId);
            loadTripData(tripId);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleLeaveTrip = async () => {
        if (!tripId || !keycloak.subject || !window.confirm('Leave this trip?')) return;
        try {
            await TripService.removeMember(tripId, keycloak.subject);
            navigate('/trips');
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{padding: '2rem', color: 'white'}}>Loading trip details...</div>;
    if (error || !trip) return <div style={{padding: '2rem', color: '#ff4444'}}>{error || 'Trip not found'}</div>;

    const isOwner = trip.myRole === 'OWNER';
    const currentUserId = keycloak.subject;

    return (
        <div className="trip-detail-page">
            <Navbar />
            
            <div className="trip-detail-content">
                
                {/* Hero Section */}
                <div className="td-hero">
                    <div className="td-hero-header">
                        <div>
                            <h1 className="td-title">{trip.name}</h1>
                            {trip.description && <p className="td-subtitle">{trip.description}</p>}
                        </div>
                        <div className="td-actions">
                            {!isOwner && (
                                <button className="cta-button-warning" onClick={handleLeaveTrip} style={{border: '1px solid #d32f2f', background: 'transparent', color: '#d32f2f', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer'}}>
                                    Leave Trip
                                </button>
                            )}
                            {/* Owner Actions (Edit) */}
                        </div>
                    </div>

                    <div className="td-meta-row">
                        {trip.destination && (
                            <div className="td-meta-item">
                                <MapPinIcon />
                                <span className="td-meta-text">{trip.destination}</span>
                            </div>
                        )}
                        {(trip.startDate || trip.endDate) && (
                            <div className="td-meta-item">
                                <CalendarIcon />
                                <span className="td-meta-text">{trip.startDate} - {trip.endDate}</span>
                            </div>
                        )}
                        <div className="td-meta-item" style={{marginLeft: 'auto'}}>
                            <span className={`td-status-badge status-${trip.status}`}>
                                {trip.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Grid: Content (Left) + Sidebar (Right) */}
                <div className="td-grid">
                    
                    {/* Main Content Area */}
                    <div className="td-main-column">
                        <div className="td-section">
                            <div className="td-section-header">
                                <h2 className="td-section-title">Itinerary</h2>
                                <button style={{background: 'none', border: 'none', color: '#888', cursor: 'pointer'}}>+ Add Item</button>
                            </div>
                            
                            <div className="itinerary-placeholder">
                                <div className="placeholder-icon">🗺️</div>
                                <p>No itinerary items yet.</p>
                                <span style={{fontSize: '0.8rem', opacity: 0.6}}>Plan your daily activities here.</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="td-sidebar">
                        <div className="td-section">
                            <div className="td-section-header">
                                <h2 className="td-section-title">Members ({members.length})</h2>
                                {isOwner && (
                                    <button 
                                        className="text-btn" 
                                        onClick={() => setShowAddMember(!showAddMember)}
                                        style={{background: 'none', border: 'none', color: '#64B5F6', cursor: 'pointer', fontSize: '0.9rem'}}
                                    >
                                        {showAddMember ? 'Cancel' : 'Add Member'}
                                    </button>
                                )}
                            </div>

                            {showAddMember && (
                                <form onSubmit={handleAddMember} className="add-member-form" style={{marginBottom: '1rem'}}>
                                    <input 
                                        type="text" 
                                        className="input-dark" 
                                        placeholder="User ID"
                                        value={addMemberId}
                                        onChange={e => setAddMemberId(e.target.value)}
                                        required
                                    />
                                    <button type="submit" style={{background: '#333', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', padding: '0 0.75rem'}}>
                                        +
                                    </button>
                                </form>
                            )}

                            <div className="member-list">
                                {members.map(member => (
                                    <div key={member.id} className="member-card">
                                        <div className="member-avatar">
                                            {member.userId.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="member-details">
                                            <div className="member-name">{member.userId}</div> {/* Replace with name if available */}
                                            <div className="member-role">{member.role}</div>
                                        </div>
                                        {isOwner && member.userId !== currentUserId && (
                                            <button className="remove-btn" onClick={() => handleRemoveMember(member.userId)}>
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
            <Footer />
        </div>
    );
};

export default TripDetailPage;
