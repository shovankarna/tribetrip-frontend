import React, { useState } from 'react';
import type { AiItineraryResponse, AiRefinementRequest } from '../../../services/ItineraryService';
import AiItineraryPreview from './AiItineraryPreview';
import AiRefinementChat from './AiRefinementChat';
import Button from '../../common/Button';
import './AiPlanning.css';

interface AiPreviewStepProps {
    itinerary: AiItineraryResponse;
    onRefine: (request: AiRefinementRequest) => Promise<void>;
    onConfirm: () => void;
    onBack: () => void;
}

const AiPreviewStep: React.FC<AiPreviewStepProps> = ({ itinerary, onRefine, onConfirm, onBack }) => {
    const [isRefining, setIsRefining] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | 'ALL'>('ALL');

    const handleRefine = async (request: AiRefinementRequest) => {
        setIsRefining(true);
        try {
            await onRefine(request);
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <div className="ai-split-view" style={{flex: 1}}>
                {/* Column 1: Navigation Sidebar */}
                <div className="preview-nav-sidebar">
                    <button 
                        className={`nav-day-btn ${selectedDay === 'ALL' ? 'active' : ''}`}
                        onClick={() => setSelectedDay('ALL')}
                    >
                        All Days
                    </button>
                    {itinerary.days.map((day, idx) => (
                        <button 
                            key={day.dayOffset}
                            className={`nav-day-btn ${selectedDay === idx ? 'active' : ''}`}
                            onClick={() => setSelectedDay(idx)}
                        >
                            Day {idx + 1}
                        </button>
                    ))}
                </div>

                {/* Column 2: Main Content */}
                <div className="preview-content-area">
                    <AiItineraryPreview itinerary={itinerary} selectedDay={selectedDay} />
                </div>

                {/* Column 3: Refinement Chat */}
                <div className="ai-controls-panel">
                    <div style={{padding: '20px', borderBottom: '1px solid #333'}}>
                        <h3 style={{marginTop: 0, color: '#fff'}}>Refine Itinerary</h3>
                        <p style={{fontSize: '0.9rem', color: '#aaa'}}>
                            Not quite right? Ask AI to tweak it.
                        </p>
                    </div>
                    
                    <div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
                        <AiRefinementChat onRefine={handleRefine} isUpdating={isRefining} />
                    </div>
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="ai-wizard-footer">
                <div style={{marginRight: 'auto', display: 'flex', alignItems: 'center', color: '#aaa', fontSize: '0.9rem'}}>
                    This itinerary will be saved to your templates.
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                    <Button variant="outline" onClick={onBack} disabled={isRefining}>
                        Back
                    </Button>
                    <Button variant="primary" onClick={onConfirm} disabled={isRefining}>
                        Confirm & Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AiPreviewStep;
