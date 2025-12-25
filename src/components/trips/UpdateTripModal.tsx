import React, { useState, useEffect } from 'react';
import { type Trip, TripService } from '../../services/TripService';
import toast from 'react-hot-toast';
import '../common/ConfirmationModal.css'; // Reuse modal styles

interface UpdateTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    trip: Trip;
}

const UpdateTripModal: React.FC<UpdateTripModalProps> = ({ isOpen, onClose, onSuccess, trip }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        destination: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (trip) {
            setFormData({
                name: trip.name,
                description: trip.description || '',
                destination: trip.destination || '',
                startDate: trip.startDate || '',
                endDate: trip.endDate || ''
            });
        }
    }, [trip, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await TripService.updateTrip(trip.id, formData);
            toast.success("Trip updated successfully");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to update trip");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit Trip</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ color: '#aaa', fontSize: '0.875rem' }}>Trip Name</label>
                        <input
                            type="text"
                            name="name"
                            className="input-dark"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label style={{ color: '#aaa', fontSize: '0.875rem' }}>Destination</label>
                        <input
                            type="text"
                            name="destination"
                            className="input-dark"
                            value={formData.destination}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '0.875rem' }}>Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="input-dark"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '0.875rem' }}>End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                className="input-dark"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ color: '#aaa', fontSize: '0.875rem' }}>Description</label>
                        <textarea
                            name="description"
                            className="input-dark"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="modal-btn cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn confirm">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateTripModal;
