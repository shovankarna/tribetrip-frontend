import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
// import Button from '../components/common/Button'; // Unused
import keycloak from '../auth';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import './TripDetailPage.css';
import { TripService, type Trip, type TripMember } from '../services/TripService';
import UpdateTripModal from '../components/trips/UpdateTripModal';
import { 
    canEditTripDetails, 
    canAddMember, 
    canRemoveMember, 
    canChangeMemberRole, 
    canChangeStatus 
} from '../utils/tripPermissions';

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

    // Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        isDestructive: false
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
            toast.error("Failed to load trip data");
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
            toast.success("Member added successfully");
        } catch (err: any) {
            toast.error(err.message || "Failed to add member");
        }
    };

    const handleRemoveMember = (userId: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Member',
            message: 'Are you sure you want to remove this member from the trip?',
            isDestructive: true,
            onConfirm: async () => {
                if (!tripId) return;
                try {
                    await TripService.removeMember(tripId, userId);
                    loadTripData(tripId);
                    toast.success("Member removed successfully");
                } catch (err: any) {
                    toast.error(err.message || "Failed to remove member");
                }
            }
        });
    };

    const handleLeaveTrip = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Leave Trip',
            message: 'Are you sure you want to leave this trip? You will lose access to the itinerary.',
            isDestructive: true,
            onConfirm: async () => {
                if (!tripId || !keycloak.subject) return;
                try {
                    await TripService.removeMember(tripId, keycloak.subject);
                    toast.success("You have left the trip");
                    navigate('/trips');
                } catch (err: any) {
                    toast.error(err.message || "Failed to leave trip");
                }
            }
        });
    };

    const handleDeleteTrip = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Trip',
            message: 'Are you sure you want to delete this trip? This action cannot be undone.',
            isDestructive: true,
            onConfirm: async () => {
                if (!tripId) return;
                try {
                    await TripService.deleteTrip(tripId);
                    toast.success("Trip deleted successfully");
                    navigate('/trips');
                } catch (err: any) {
                    toast.error(err.message || "Failed to delete trip");
                }
            }
        });
    };

    if (loading) return <div style={{padding: '2rem', color: 'white'}}>Loading trip details...</div>;
    if (error || !trip) return <div style={{padding: '2rem', color: '#ff4444'}}>{error || 'Trip not found'}</div>;

    const isOwner = trip.myRole === 'OWNER';
    const isAdmin = trip.myRole === 'ADMIN';
    const canManage = isOwner || isAdmin;
    const currentUserId = keycloak.subject;

    const handleStatusChange = async (newStatus: Trip['status']) => {
        if (!trip) return;
        try {
            await TripService.updateTripStatus(trip.id, newStatus);
            loadTripData(trip.id);
            toast.success(`Trip status updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to update status");
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'MEMBER') => {
        if (!trip) return;
        try {
            await TripService.updateMemberRole(trip.id, userId, newRole);
            loadTripData(trip.id);
            toast.success("Member role updated");
        } catch (err: any) {
             toast.error(err.message || "Failed to update role");
        }
    };

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
                            {isOwner && (
                                <>
                                    {canEditTripDetails(trip.status, trip.myRole) && (
                                        <button 
                                            className="cta-button-secondary" 
                                            onClick={() => setIsEditModalOpen(true)}
                                            style={{marginRight: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer'}}
                                        >
                                            Edit Trip
                                        </button>
                                    )}
                                    <button 
                                        className="cta-button-warning" 
                                        onClick={handleDeleteTrip} 
                                        style={{border: '1px solid #d32f2f', background: 'transparent', color: '#d32f2f', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer'}}
                                    >
                                        Delete Trip
                                    </button>
                                </>
                            )}
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
                            {canManage && canChangeStatus(trip.status, trip.myRole) ? (
                                <select 
                                    className={`td-status-badge status-${trip.status}`} 
                                    value={trip.status} 
                                    onChange={(e) => handleStatusChange(e.target.value as Trip['status'])}
                                    style={{border: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '1rem'}}
                                >
                                    <option value="DRAFT">DRAFT</option>
                                    <option value="PLANNING">PLANNING</option>
                                    <option value="CONFIRMED">CONFIRMED</option>
                                    <option value="ONGOING">ONGOING</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            ) : (
                                <span className={`td-status-badge status-${trip.status}`}>
                                    {trip.status}
                                </span>
                            )}
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
                                {canAddMember(trip.status, trip.myRole) && (
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
                                            <div className="member-actions-row" style={{display:'flex', alignItems:'center', gap: '0.5rem'}}>
                                                <div className={`member-role role-${member.role}`}>{member.role}</div>
                                                {canChangeMemberRole(trip.status, trip.myRole) && member.userId !== currentUserId && member.role !== 'OWNER' && (
                                                    <select 
                                                        className="role-select" 
                                                        value={member.role} 
                                                        onChange={(e) => handleRoleChange(member.userId, e.target.value as 'ADMIN' | 'MEMBER')}
                                                        style={{fontSize: '0.7rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', padding: '1px 4px'}}
                                                    >
                                                        <option value="MEMBER">Member</option>
                                                        <option value="ADMIN">Admin</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                        {canRemoveMember(trip.status, trip.myRole) && member.userId !== currentUserId && member.role !== 'OWNER' && (member.role !== 'ADMIN' || isOwner) && (
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
            
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
            />
            
            {trip && (
                <UpdateTripModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSuccess={() => loadTripData(trip.id)} 
                    trip={trip} 
                />
            )}
        </div>
    );
};

export default TripDetailPage;
