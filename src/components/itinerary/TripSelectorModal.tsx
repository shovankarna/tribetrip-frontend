import React, { useState, useEffect } from 'react';
import { TripService, type Trip } from '../../services/TripService';
import toast from 'react-hot-toast';

interface TripSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (tripId: string) => Promise<void>;
}

const TripSelectorModal: React.FC<TripSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTripId, setSelectedTripId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadTrips();
        }
    }, [isOpen]);

    const loadTrips = async () => {
        setLoading(true);
        try {
            const data = await TripService.getUserTrips();
            // Filter only trips where user is OWNER or ADMIN? User said "OWNER or ADMIN".
            // Backend should handle permissions, but UI can filter.
            // Assumption: Trip object has `myRole`.
            const eligible = data.filter(t => t.myRole === 'OWNER' || t.myRole === 'ADMIN');
            setTrips(eligible);
        } catch (err) {
            toast.error("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!selectedTripId) return;
        setSubmitting(true);
        try {
            await onSelect(selectedTripId);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
            <div style={{
                background: '#1E1E1E', padding: '2rem', borderRadius: '12px', 
                width: '100%', maxWidth: '500px', border: '1px solid #333', color: 'white'
            }}>
                <h2 style={{marginTop: 0}}>Attach to Trip</h2>
                <p style={{color: '#AAA'}}>Select a trip to apply this itinerary template to.</p>
                
                {loading ? (
                    <div>Loading trips...</div>
                ) : trips.length === 0 ? (
                    <div>You don't have any eligible trips (Owner/Admin).</div>
                ) : (
                    <div style={{margin: '1rem 0'}}>
                        <select 
                            value={selectedTripId} 
                            onChange={e => setSelectedTripId(e.target.value)}
                            style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                        >
                            <option value="">-- Select a Trip --</option>
                            {trips.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem'}}>
                    <button onClick={onClose} style={{background: 'transparent', border: '1px solid #444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer'}}>Cancel</button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={!selectedTripId || submitting}
                        style={{
                            background: 'white', border: 'none', color: 'black', 
                            padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, 
                            cursor: (!selectedTripId || submitting) ? 'not-allowed' : 'pointer',
                            opacity: (!selectedTripId || submitting) ? 0.5 : 1
                        }}
                    >
                        {submitting ? 'Attaching...' : 'Attach'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TripSelectorModal;
