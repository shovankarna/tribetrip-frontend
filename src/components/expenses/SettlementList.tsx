import React, { useState } from 'react';
import type { SettlementResponse } from '../../services/ExpenseService';

interface SettlementListProps {
    settlements: SettlementResponse[];
}

const SettlementList: React.FC<SettlementListProps> = ({ settlements }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (settlements.length === 0) return null;

    return (
        <div style={{marginBottom: '2rem', background: '#222', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden'}}>
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    padding: '1rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: '#2a2a2a'
                }}
            >
                <div style={{fontWeight: 600, color: 'white'}}>Who owes whom?</div>
                <div style={{color: '#888', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s'}}>▼</div>
            </div>
            
            {isExpanded && (
                <div style={{padding: '1rem'}}>
                    <p style={{marginTop: 0, marginBottom: '1rem', color: '#aaa', fontSize: '0.9rem'}}>
                        Suggested way to settle debts efficiently:
                    </p>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                        {settlements.map((s, idx) => (
                            <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ddd'}}>
                                <span style={{fontWeight: 600, color: '#FF5252'}}>{s.fromUserId}</span>
                                <span style={{color: '#888'}}>→</span>
                                <span style={{fontWeight: 600, color: '#4CAF50'}}>{s.toUserId}</span>
                                <span style={{marginLeft: 'auto', fontWeight: 'bold'}}>${s.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettlementList;
