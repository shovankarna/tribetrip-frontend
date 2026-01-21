import React, { useState, useEffect } from 'react';
import { TripService, type Trip } from '../../services/TripService';
import toast from 'react-hot-toast';

const TripSelectorModal: React.FC<TripSelectorModalProps> = ({ isOpen, onClose, onSelect, defaultName }) => {
    const [view, setView] = useState<'SELECT' | 'CREATE'>('SELECT');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTripId, setSelectedTripId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // New Trip State
    const [newTrip, setNewTrip] = useState({
        name: defaultName || '',
        destination: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            setView('SELECT');
            setNewTrip(prev => ({ ...prev, name: defaultName || '' }));
            loadTrips();
        }
    }, [isOpen, defaultName]);

    const loadTrips = async () => {
        setLoading(true);
        try {
            const data = await TripService.getUserTrips();
            const eligible = data.filter(t => t.myRole === 'OWNER' || t.myRole === 'ADMIN');
            setTrips(eligible);
        } catch (err) {
            toast.error("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSelect = async () => {
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

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const created = await TripService.createTrip(newTrip);
            toast.success("Trip created and template attached!");
            await onSelect(created.id);
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to create trip");
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
                {view === 'SELECT' ? (
                    <>
                        <h2 style={{marginTop: 0}}>Attach to Trip</h2>
                        <p style={{color: '#AAA'}}>Select an existing trip or create a new one.</p>
                        
                        {loading ? (
                            <div>Loading trips...</div>
                        ) : (
                            <div style={{margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                {trips.length > 0 && (
                                    <select 
                                        value={selectedTripId} 
                                        onChange={e => setSelectedTripId(e.target.value)}
                                        style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                    >
                                        <option value="">-- Select Existing Trip --</option>
                                        {trips.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                                        ))}
                                    </select>
                                )}
                                
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <div style={{flex: 1, height: '1px', background: '#333'}}></div>
                                    <span style={{color: '#666', fontSize: '0.8rem'}}>OR</span>
                                    <div style={{flex: 1, height: '1px', background: '#333'}}></div>
                                </div>

                                <button 
                                    onClick={() => setView('CREATE')}
                                    className="btn-secondary-sm"
                                    style={{width: '100%', justifyContent: 'center', padding: '0.8rem'}}
                                >
                                    + Create New Trip with this Template
                                </button>
                            </div>
                        )}

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem'}}>
                            <button onClick={onClose} style={{background: 'transparent', border: '1px solid #444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer'}}>Cancel</button>
                            <button 
                                onClick={handleConfirmSelect} 
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
                    </>
                ) : (
                    <>
                        <h2 style={{marginTop: 0}}>Create New Trip</h2>
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
                                     value={newTrip.destination}
                                     onChange={e => setNewTrip({...newTrip, destination: e.target.value})}
                                     style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                 />
                             </div>
                             <div style={{display: 'flex', gap: '1rem'}}>
                                 <div style={{flex: 1}}>
                                     <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Start Date</label>
                                     <input 
                                         type="date" 
                                         value={newTrip.startDate}
                                         onChange={e => setNewTrip({...newTrip, startDate: e.target.value})}
                                         style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                     />
                                 </div>
                                 <div style={{flex: 1}}>
                                     <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>End Date</label>
                                     <input 
                                         type="date" 
                                         value={newTrip.endDate}
                                         onChange={e => setNewTrip({...newTrip, endDate: e.target.value})}
                                         style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                     />
                                 </div>
                             </div>
                             <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                                 <button type="button" onClick={() => setView('SELECT')} style={{background: 'transparent', border: '1px solid #444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer'}}>Back</button>
                                 <button type="submit" disabled={submitting} style={{background: '#6366f1', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'}}>
                                    {submitting ? 'Creating...' : 'Create & Attach'}
                                 </button>
                             </div>
                         </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default TripSelectorModal;
