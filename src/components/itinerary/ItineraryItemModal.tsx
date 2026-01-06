import React, { useState, useEffect } from 'react';

interface ItineraryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: any) => Promise<void>;
    initialData?: any;
    isTripItem?: boolean; // Changes labels if needed (e.g. Date vs Day Offset)
}

const ItineraryItemModal: React.FC<ItineraryItemModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData,
    isTripItem = false 
}) => {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [locationText, setLocationText] = useState('');
    const [time, setTime] = useState(''); // Maps to defaultStartTime or startTime
    const [duration, setDuration] = useState<number | ''>(''); // Maps to defaultDurationMinutes or durationMinutes
    const [dayOffset, setDayOffset] = useState(0); // Maps to defaultDayOffset
    const [date, setDate] = useState(''); // For Trip Items (date)
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title || '');
            setNotes(initialData.notes || '');
            setLocationText(initialData.locationText || initialData.location || '');
            // Handle both template and trip item fields
            setTime(initialData.defaultStartTime || initialData.startTime || initialData.time || '');
            setDuration(initialData.defaultDurationMinutes || initialData.durationMinutes || initialData.duration || '');
            setDayOffset(initialData.defaultDayOffset !== undefined ? initialData.defaultDayOffset : (initialData.dayOffset || 0));
            setDate(initialData.date || '');
        } else {
            // Reset
            setTitle('');
            setNotes('');
            setLocationText('');
            setTime('');
            setDuration('');
            setDayOffset(0);
            setDate('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data: any = {
                title,
                notes,
                locationText,
            };

            if (isTripItem) {
                // Trip Item
                data.date = date;
                data.startTime = time || undefined;
                data.durationMinutes = duration ? Number(duration) : undefined;
            } else {
                // Template Item
                data.defaultDayOffset = Number(dayOffset);
                data.defaultStartTime = time || undefined;
                data.defaultDurationMinutes = duration ? Number(duration) : undefined;
            }

            await onSave(data);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
            <div style={{
                background: '#1E1E1E', padding: '2rem', borderRadius: '12px', 
                width: '100%', maxWidth: '500px', border: '1px solid #333', color: 'white'
            }}>
                <h2 style={{marginTop: 0}}>{initialData ? 'Edit Item' : 'Add Item'}</h2>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div>
                        <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Title</label>
                        <input 
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                        />
                    </div>

                    <div style={{display: 'flex', gap: '1rem'}}>
                        {isTripItem ? (
                            <div style={{flex: 1}}>
                                <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Date</label>
                                <input 
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                />
                            </div>
                        ) : (
                            <div style={{flex: 1}}>
                                <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Day Number (1 = Start)</label>
                                <input 
                                    type="number"
                                    min="1"
                                    required
                                    value={dayOffset + 1}
                                    onChange={e => setDayOffset(parseInt(e.target.value) - 1)}
                                    style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                                />
                            </div>
                        )}
                        <div style={{flex: 1}}>
                             <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Time (Optional)</label>
                             <input 
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                            />
                        </div>
                    </div>

                    <div>
                         <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Location (Optional)</label>
                         <input 
                            value={locationText}
                            onChange={e => setLocationText(e.target.value)}
                            style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                        />
                    </div>

                    <div>
                        <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Notes</label>
                        <textarea 
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                        />
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem'}}>
                        <button type="button" onClick={onClose} style={{background: 'transparent', border: '1px solid #444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer'}}>Cancel</button>
                        <button type="submit" disabled={saving} style={{background: 'white', border: 'none', color: 'black', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'}}>
                            {saving ? 'Saving...' : 'Save Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItineraryItemModal;
