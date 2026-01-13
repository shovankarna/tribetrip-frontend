import React from 'react';
import type { Expense } from '../../services/ExpenseService';
import { useUserNames } from '../../hooks/useUserNames';

interface ExpenseListProps {
    expenses: Expense[];
    onDelete?: (expenseId: string) => void;
    currentUserId: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, currentUserId }) => {
    const userIds = expenses.map(e => e.createdByUserId);
    const { getName } = useUserNames(userIds);
    if (expenses.length === 0) {
        return <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>No expenses yet</div>;
    }

    return (
        <div className="expense-list">
            {expenses.map(expense => {
                const isPayer = expense.participants.some(p => p.userId === currentUserId && (p.amountPaid || 0) > 0);
                const isOwer = expense.participants.some(p => p.userId === currentUserId && (p.amountOwed || 0) > 0);

                return (
                    <div key={expense.id} style={{
                        background: '#252525',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderLeft: isPayer ? '4px solid #4CAF50' : '4px solid transparent'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '8px', background: '#333', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                            }}>
                                💸
                            </div>
                            <div>
                                <div style={{fontWeight: 600, color: 'white', fontSize: '1rem'}}>{expense.title}</div>
                                <div style={{fontSize: '0.8rem', color: '#aaa'}}>
                                    Paid by <span style={{color: 'white'}}>{getName(expense.createdByUserId)}</span> • {new Date(expense.expenseDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{textAlign: 'right'}}>
                            <div style={{fontWeight: 'bold', color: 'white', fontSize: '1.1rem'}}>
                                ${expense.totalAmount.toFixed(2)}
                            </div>
                            {isOwer && !isPayer && (
                                <div style={{fontSize: '0.7rem', background: '#FF5252', color: 'white', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px'}}>
                                    You owe
                                </div>
                            )}
                            {expense.createdByUserId === currentUserId && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete && onDelete(expense.id); }}
                                    style={{
                                        background: 'none', border: 'none', color: '#666', cursor: 'pointer', 
                                        marginLeft: '0.5rem', fontSize: '0.9rem'
                                    }}
                                    title="Delete Expense"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ExpenseList;
