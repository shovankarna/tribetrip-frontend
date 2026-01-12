import React from 'react';
import type { BalanceResponse } from '../../services/ExpenseService';

interface BalanceCardsProps {
    balances: BalanceResponse[];
    members: any[]; // TripMember[]
}

const BalanceCards: React.FC<BalanceCardsProps> = ({ balances, members }) => {
    
    const getMemberName = (userId: string) => {
        // In real app, look up name from members list
        // For MVP, using userId or partial
        return userId; 
    };

    return (
        <div className="balance-cards-container" style={{
            display: 'flex', 
            gap: '1rem', 
            overflowX: 'auto', 
            paddingBottom: '0.5rem',
            marginBottom: '2rem'
        }}>
            {balances.map(balance => {
                const isOwed = balance.balance > 0;
                const owes = balance.balance < 0;
                const isSettled = balance.balance === 0;
                
                return (
                    <div key={balance.userId} style={{
                        minWidth: '160px',
                        background: '#252525',
                        borderRadius: '12px',
                        padding: '1rem',
                        border: '1px solid #333',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', background: '#444', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem'
                        }}>
                            {balance.userId.substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{fontWeight: 600, color: 'white', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%'}}>
                            {balance.userId}
                        </div>
                        
                        {isOwed && (
                            <>
                                <div style={{fontSize: '0.75rem', color: '#aaa'}}>is owed</div>
                                <div style={{color: '#4CAF50', fontWeight: 'bold'}}>
                                    ${balance.balance.toFixed(2)}
                                </div>
                            </>
                        )}
                        {owes && (
                            <>
                                <div style={{fontSize: '0.75rem', color: '#aaa'}}>owes</div>
                                <div style={{color: '#FF5252', fontWeight: 'bold'}}>
                                    ${Math.abs(balance.balance).toFixed(2)}
                                </div>
                            </>
                        )}
                        {isSettled && (
                             <div style={{fontSize: '0.9rem', color: '#888'}}>Settled</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BalanceCards;
