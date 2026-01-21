import React from 'react';
import type { AiItineraryResponse } from '../../../services/ItineraryService';
import './AiPlanning.css';

interface AiItineraryPreviewProps {
    itinerary: AiItineraryResponse;
    selectedDay: number | 'ALL';
}

const AiItineraryPreview: React.FC<AiItineraryPreviewProps> = ({ itinerary, selectedDay }) => {
    
    const daysToShow = selectedDay === 'ALL' 
        ? itinerary.days 
        : itinerary.days.filter((d, i) => i === selectedDay);

    return (
        <div>
            {/* Header Section */}
            <div className="preview-header-section">
                <h2 style={{margin: '0 0 10px 0', fontSize: '1.8rem'}}>{itinerary.title}</h2>
                <div style={{display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#666', flexWrap: 'wrap'}}>
                    {itinerary.pace && (
                        <span className="ai-chip static">
                            {itinerary.pace} Pace
                        </span>
                    )}
                    {itinerary.assumptions?.map((a, i) => (
                        <span key={i} className="ai-chip static">
                            {a}
                        </span>
                    ))}
                </div>
                {itinerary.description && (
                    <p style={{color: '#9ca3af', lineHeight: 1.6, marginTop: '15px', maxWidth: '800px'}}>
                        {itinerary.description}
                    </p>
                )}
            </div>

            {/* Timeline */}
            <div className="preview-timeline-container">
                {daysToShow.map((day) => (
                    <div key={day.dayOffset} className="day-section">
                        <div className="day-section-header">
                            Day {day.dayOffset + 1}
                        </div>
                        
                        <div className="preview-items">
                            {day.items.map((item, idx) => (
                                <div key={idx} className="preview-item">
                                    <div className="preview-time">
                                        {item.startTime || '--:--'}
                                    </div>
                                    <div className="preview-details">
                                        <h4>{item.title}</h4>
                                        {item.location && (
                                            <div style={{fontSize: '0.85rem', color: '#888', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                📍 {item.location}
                                            </div>
                                        )}
                                        {item.description && <p>{item.description}</p>}
                                        {item.notes && (
                                            <div style={{fontSize: '0.85rem', fontStyle: 'italic', marginTop: '8px', color: '#666'}}>
                                                Note: {item.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AiItineraryPreview;
