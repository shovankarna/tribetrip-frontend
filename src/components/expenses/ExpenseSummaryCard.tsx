import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseService } from '../../services/ExpenseService';
import type { BalanceResponse } from '../../services/ExpenseService';
import keycloak from '../../auth';

interface ExpenseSummaryCardProps {
    tripId: string;
}

const ExpenseSummaryCard: React.FC<ExpenseSummaryCardProps> = ({ tripId }) => {
    const navigate = useNavigate();
    const [myBalance, setMyBalance] = useState<number | null>(null);
    const [currency] = useState<string>('USD'); // Default, ideal to fetch from trip settings
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const balances = await ExpenseService.getBalances(tripId);
                const currentUserBalance = balances.find(b => b.userId === keycloak.subject);
                if (currentUserBalance) {
                    setMyBalance(currentUserBalance.balance);
                } else {
                    setMyBalance(0);
                }
            } catch (error) {
                console.error("Failed to fetch balance", error);
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchBalance();
        }
    }, [tripId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(Math.abs(amount));
    };

    if (loading) return <div className="expense-summary-card skeleton">Loading...</div>;

    const isOwed = myBalance !== null && myBalance > 0;
    const owes = myBalance !== null && myBalance < 0;
    const isSettled = myBalance === 0;

    return (
        <div className="expense-summary-card" style={{
            background: '#1E1E1E', 
            borderRadius: '12px', 
            padding: '1.5rem', 
            marginTop: '1rem',
            border: '1px solid #333'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h3 style={{margin: 0, fontSize: '1.2rem', color: 'white'}}>Expenses</h3>
            </div>
            
            <div className="balance-summary" style={{marginBottom: '1.5rem'}}>
                {isOwed && (
                    <div>
                        <span style={{color: '#aaa', fontSize: '0.9rem'}}>You are owed</span>
                        <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50'}}>
                            {formatCurrency(myBalance!)}
                        </div>
                    </div>
                )}
                {owes && (
                    <div>
                        <span style={{color: '#aaa', fontSize: '0.9rem'}}>You owe</span>
                        <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#FF5252'}}>
                            {formatCurrency(myBalance!)}
                        </div>
                    </div>
                )}
                {isSettled && (
                    <div style={{color: '#aaa'}}>
                        All settled up!
                    </div>
                )}
            </div>

            <button 
                onClick={() => navigate(`/trips/${tripId}/expenses`)}
                style={{
                    width: '100%',
                    background: '#333',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                }}
            >
                View Expenses →
            </button>
        </div>
    );
};

export default ExpenseSummaryCard;
