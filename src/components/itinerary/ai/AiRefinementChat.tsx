import React, { useState } from 'react';
import type { AiRefinementRequest } from '../../../services/ItineraryService';
import Button from '../../common/Button';
import './AiPlanning.css';

interface AiRefinementChatProps {
    onRefine: (request: AiRefinementRequest) => void;
    isUpdating: boolean;
}

const SUGGESTIONS = [
    { label: "Relax the pace", type: 'PACE_CHANGE', value: 'RELAXED' },
    { label: "Make it more active", type: 'PACE_CHANGE', value: 'PACKED' },
    { label: "Include nightlife", type: 'ADD_ACTIVITY_TYPE', value: 'nightlife' },
    { label: "Fewer museums", type: 'REMOVE_ACTIVITY_TYPE', value: 'museums' }
];

const AiRefinementChat: React.FC<AiRefinementChatProps> = ({ onRefine, isUpdating }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;
        
        let type: any = 'ADD_ACTIVITY_TYPE';
        const lower = inputValue.toLowerCase();
        
        if (lower.includes("pace") || lower.includes("relaxed") || lower.includes("active")) {
            type = 'PACE_CHANGE';
        } else if (lower.includes("remove") || lower.includes("less") || lower.includes("fewer")) {
            type = 'REMOVE_ACTIVITY_TYPE';
        }

        onRefine({
            refinementType: type,
            value: inputValue
        });
        setInputValue('');
    };

    return (
        <div className="ai-chat-container">
            {isUpdating && (
                <div style={{ marginBottom: '15px', color: '#6366f1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="spinner" style={{width: 16, height: 16, borderWidth: 2, margin: 0}}></div>
                    AI is updating your itinerary...
                </div>
            )}

            <div className="ai-suggestions">
                {SUGGESTIONS.map((s, idx) => (
                    <button
                        key={idx}
                        className="ai-chip"
                        disabled={isUpdating}
                        onClick={() => onRefine({ refinementType: s.type as any, value: s.value })}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <div className="ai-chat-input-box">
                <textarea
                    className="ai-chat-textarea"
                    placeholder="Ask AI to adjust..."
                    value={inputValue}
                    onChange={e => {
                        setInputValue(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            if (e.ctrlKey) {
                                setInputValue(prev => prev + "\n");
                            } else {
                                e.preventDefault();
                                if (!isUpdating) handleSend();
                            }
                        }
                    }}
                    disabled={isUpdating}
                    rows={1}
                />
                <button 
                    className="ai-send-icon-btn"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isUpdating}
                    title="Refine Itinerary (Enter)"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                </button>
            </div>
            <div style={{fontSize: '0.7rem', color: '#666', marginTop: '6px', textAlign: 'right'}}>
                Enter to submit, Ctrl+Enter for new line
            </div>
        </div>
    );
};

export default AiRefinementChat;
