import React, { useState } from 'react';
import type { AiItineraryRequest } from '../../../services/ItineraryService';
import Button from '../../common/Button';
import './AiPlanning.css';

interface AiInputStepProps {
    onGenerate: (request: AiItineraryRequest) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const AiInputStep: React.FC<AiInputStepProps> = ({ onGenerate, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<AiItineraryRequest>({
        destination: '',
        month: '',
        durationDays: 3,
        budgetType: 'MID',
        tripType: 'LEISURE',
        groupType: 'COUPLE',
        numberOfPeople: 2,
        pace: 'BALANCED'
    });

    const handleChange = (field: keyof AiItineraryRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(formData);
    };

    return (
        <div className="ai-input-wrapper">
            <h2>Plan your itinerary with AI <span className="ai-sparkle">✨</span></h2>
            <p style={{ color: '#aaa', marginTop: 0 }}>Tell us about your trip. You can refine the plan later.</p>

            <form onSubmit={handleSubmit}>
                <div className="ai-input-grid">
                    <div className="full-width">
                        <label className="form-label">Where to?</label>
                        <input
                            className="form-input"
                            type="text"
                            required
                            placeholder="e.g. Paris, Tokyo, Goa"
                            value={formData.destination}
                            onChange={e => handleChange('destination', e.target.value)}
                        />
                    </div>

            <div className="full-width">
                        <label className="form-label">Preferred Month</label>
                        <select
                            className="form-input"
                            required
                            value={formData.month}
                            onChange={e => handleChange('month', e.target.value)}
                        >
                            <option value="">Select Month</option>
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Duration (Days)</label>
                        <input
                            className="form-input"
                            type="number"
                            min={1}
                            max={30}
                            required
                            value={formData.durationDays}
                            onChange={e => handleChange('durationDays', parseInt(e.target.value))}
                        />
                    </div>

                    <div>
                        <label className="form-label">Trip Type</label>
                        <select
                            className="form-input"
                            value={formData.tripType}
                            onChange={e => handleChange('tripType', e.target.value)}
                        >
                            <option value="LEISURE">Leisure</option>
                            <option value="ADVENTURE">Adventure</option>
                            <option value="CULTURE">Culture</option>
                            <option value="FOODIE">Foodie</option>
                            <option value="RELAXED">Relaxed</option>
                            <option value="NIGHTLIFE">Nightlife</option>
                            <option value="MIXED">Mixed</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Budget</label>
                        <select
                            className="form-input"
                            value={formData.budgetType}
                            onChange={e => handleChange('budgetType', e.target.value)}
                        >
                            <option value="LOW">Low Budget</option>
                            <option value="MID">Mid Range</option>
                            <option value="HIGH">High End</option>
                            <option value="LUXURY">Luxury</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Group Type</label>
                        <select
                            className="form-input"
                            value={formData.groupType}
                            onChange={e => handleChange('groupType', e.target.value)}
                        >
                            <option value="SOLO">Solo</option>
                            <option value="COUPLE">Couple</option>
                            <option value="FAMILY">Family</option>
                            <option value="FRIENDS">Friends</option>
                            <option value="BUSINESS">Business</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Number of People</label>
                        <input
                            className="form-input"
                            type="number"
                            min={1}
                            required
                            value={formData.numberOfPeople}
                            onChange={e => handleChange('numberOfPeople', parseInt(e.target.value))}
                        />
                    </div>
                    
                    <div className="full-width">
                        <label className="form-label">Pace Preferences</label>
                        <div style={{display: 'flex', gap: '20px', marginTop: '5px'}}>
                            {['RELAXED', 'BALANCED', 'PACKED'].map(p => (
                                <label key={p} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ddd'}}>
                                    <input 
                                        type="radio" 
                                        name="pace" 
                                        value={p}
                                        checked={formData.pace === p}
                                        onChange={() => handleChange('pace', p)}
                                    />
                                    <span style={{textTransform: 'capitalize'}}>{p.toLowerCase()}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-actions" style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                        Generate Itinerary
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AiInputStep;
