import React, { useState, useEffect } from 'react';
import keycloak from '../../auth';
import { ExpenseService } from '../../services/ExpenseService';
import type { CreateExpenseRequest, ExpenseParticipant } from '../../services/ExpenseService';
import toast from 'react-hot-toast';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    members: any[]; // TripMember[]
    onSuccess: () => void;
    currentUserRole?: string; // Optional for backward compatibility if missed elsewhere
    currentUserId?: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
    isOpen, onClose, tripId, members, onSuccess, currentUserRole, currentUserId 
}) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [payerId, setPayerId] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Advanced Split State
    const [splitType, setSplitType] = useState<'EQUAL' | 'UNEQUAL'>('EQUAL');
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

    // Initialize defaults when modal opens or members change
    useEffect(() => {
        if (isOpen && members.length > 0) {
            setPayerId(currentUserId || keycloak.subject || members[0].userId);
            // Select all members by default
            setSelectedMembers(new Set(members.map(m => m.userId)));
            setCustomAmounts({});
        }
    }, [isOpen, members, currentUserId]);

    if (!isOpen) return null;

    const canManageCurrency = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

    const toggleMember = (userId: string) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedMembers(newSelected);
    };

    const handleCustomAmountChange = (userId: string, value: string) => {
        setCustomAmounts(prev => ({ ...prev, [userId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || selectedMembers.size === 0) return;

        const total = parseFloat(amount);
        if (isNaN(total) || total <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        // Validation for Unequal Split
        if (splitType === 'UNEQUAL') {
            let sum = 0;
            selectedMembers.forEach(userId => {
                const val = parseFloat(customAmounts[userId] || '0');
                sum += isNaN(val) ? 0 : val;
            });
            
            // Allow small float error
            if (Math.abs(sum - total) > 0.05) {
                toast.error(`Sum of shares (${sum.toFixed(2)}) must equal Total Amount (${total.toFixed(2)})`);
                return;
            }
        }

        setLoading(true);
        try {
            const participants: ExpenseParticipant[] = [];
            const allInvolvedIds = new Set([...Array.from(selectedMembers), payerId]);
            const finalParticipants: ExpenseParticipant[] = [];
            const shareIfEqual = total / selectedMembers.size;

            allInvolvedIds.forEach(userId => {
                let paid = 0;
                let owed = 0;

                if (userId === payerId) paid = total;

                if (selectedMembers.has(userId)) {
                    if (splitType === 'EQUAL') {
                        owed = shareIfEqual;
                    } else {
                         owed = parseFloat(customAmounts[userId] || '0');
                    }
                }

                finalParticipants.push({
                    userId,
                    amountPaid: paid,
                    amountOwed: owed
                });
            });

            const request: CreateExpenseRequest = {
                tripId,
                title,
                totalAmount: total,
                currency: currency, // Uses state (default USD or selected)
                expenseDate: new Date(date).toISOString(),
                splitType: 'EXACT', // Always sending EXACT to control amounts precisely
                participants: finalParticipants
            };

            await ExpenseService.createExpense(request);
            toast.success("Expense added");
            onSuccess();
            onClose();
            // Reset form
            setTitle('');
            setAmount('');
            setCustomAmounts({});
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: '#1E1E1E', width: '90%', maxWidth: '600px', maxHeight: '90vh',
                borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column',
                border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{marginTop: 0, color: 'white', marginBottom: '1.5rem'}}>Add Expense</h2>
                
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
                    <div style={{overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        {/* Basic Info */}
                        <div>
                             {/* Title Input */}
                            <label style={{color: '#aaa', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem'}}>Description</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="e.g. Dinner"
                                style={{width: '100%', padding: '0.75rem', background: '#333', border: 'none', borderRadius: '6px', color: 'white'}}
                            />
                        </div>

                        <div style={{display: 'flex', gap: '1rem'}}>
                            <div style={{flex: 1}}>
                                <label style={{color: '#aaa', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem'}}>Amount</label>
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                    {/* Currency Selector - Conditionally Rendered */}
                                    {canManageCurrency && (
                                        <select
                                            value={currency}
                                            onChange={e => setCurrency(e.target.value)}
                                            style={{padding: '0.75rem', background: '#333', border: 'none', borderRadius: '6px', color: 'white'}}
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="INR">INR</option>
                                            <option value="CAD">CAD</option>
                                        </select>
                                    )}
                                    {!canManageCurrency && (
                                         <div style={{
                                             padding: '0.75rem', background: '#252525', 
                                             borderRadius: '6px', color: '#888', 
                                             display: 'flex', alignItems: 'center', userSelect: 'none'
                                         }}>
                                             {currency}
                                         </div>
                                    )}
                                    
                                    <input 
                                        type="number" 
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        required
                                        min="0.01" step="0.01"
                                        placeholder="0.00"
                                        style={{width: '100%', padding: '0.75rem', background: '#333', border: 'none', borderRadius: '6px', color: 'white', flex: 1}}
                                    />
                                </div>
                            </div>
                            <div style={{flex: 1}}>
                                 <label style={{color: '#aaa', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem'}}>Paid By</label>
                                 <select 
                                    value={payerId}
                                    onChange={e => setPayerId(e.target.value)}
                                    style={{width: '100%', padding: '0.75rem', background: '#333', border: 'none', borderRadius: '6px', color: 'white'}}
                                 >
                                    {members.map(m => (
                                        <option key={m.userId} value={m.userId}>{m.userId}</option>
                                    ))}
                                 </select>
                            </div>
                        </div>

                        <div>
                            <label style={{color: '#aaa', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem'}}>Date</label>
                            <input 
                                type="date" 
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                style={{width: '100%', padding: '0.75rem', background: '#333', border: 'none', borderRadius: '6px', color: 'white'}}
                            />
                        </div>

                        <hr style={{borderColor: '#333', margin: '0.5rem 0', width: '100%'}}/>

                        {/* Split Type Toggle */}
                        <div>
                            <label style={{color: '#aaa', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem'}}>Split Method</label>
                            <div style={{display: 'flex', gap: '0.5rem', background: '#333', padding: '4px', borderRadius: '8px'}}>
                                <button
                                    type="button"
                                    onClick={() => setSplitType('EQUAL')}
                                    style={{
                                        flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                        background: splitType === 'EQUAL' ? '#3D5AFE' : 'transparent',
                                        color: splitType === 'EQUAL' ? 'white' : '#aaa',
                                        fontWeight: 600
                                    }}
                                >
                                    Equally
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSplitType('UNEQUAL')}
                                    style={{
                                        flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                        background: splitType === 'UNEQUAL' ? '#3D5AFE' : 'transparent',
                                        color: splitType === 'UNEQUAL' ? 'white' : '#aaa',
                                        fontWeight: 600
                                    }}
                                >
                                    Unequally
                                </button>
                            </div>
                        </div>

                        {/* Members List */}
                        <div>
                            <label style={{color: '#aaa', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem'}}>Includes</label>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                {members.map(member => {
                                    const isSelected = selectedMembers.has(member.userId);
                                    let shareDisplay = '';
                                    if (isSelected && amount) {
                                        if (splitType === 'EQUAL') {
                                            shareDisplay = (parseFloat(amount) / selectedMembers.size).toFixed(2);
                                        } 
                                    }

                                    return (
                                        <div key={member.userId} style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: '#252525', borderRadius: '8px'}}>
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => toggleMember(member.userId)}
                                                style={{width: '18px', height: '18px', cursor: 'pointer'}}
                                            />
                                            <span style={{flex: 1, fontWeight: 500}}>{member.userId}</span>
                                            
                                            {isSelected && (
                                                <div style={{minWidth: '100px'}}>
                                                    {splitType === 'EQUAL' ? (
                                                        <div style={{textAlign: 'right', color: '#aaa', padding: '0.5rem'}}>
                                                            ${shareDisplay}
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            type="number"
                                                            placeholder="0.00"
                                                            min="0"
                                                            step="0.01"
                                                            value={customAmounts[member.userId] || ''}
                                                            onChange={(e) => handleCustomAmountChange(member.userId, e.target.value)}
                                                            style={{
                                                                width: '100px', padding: '0.5rem', background: '#333', 
                                                                border: '1px solid #444', borderRadius: '4px', 
                                                                color: 'white', textAlign: 'right'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {splitType === 'UNEQUAL' && amount && (
                                <div style={{textAlign: 'right', marginTop: '0.5rem', fontSize: '0.9rem'}}>
                                    <span style={{color: '#aaa'}}>Left to split: </span>
                                    <span style={{
                                        color: Math.abs(parseFloat(amount) - Array.from(selectedMembers).reduce((acc, uid) => acc + (parseFloat(customAmounts[uid]||'0') || 0), 0)) < 0.05 ? '#4CAF50' : '#FF5252'
                                    }}>
                                        ${(parseFloat(amount) - Array.from(selectedMembers).reduce((acc, uid) => acc + (parseFloat(customAmounts[uid]||'0') || 0), 0)).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
                        <button 
                            type="button" 
                            onClick={onClose}
                            style={{background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer'}}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !title || !amount || selectedMembers.size === 0}
                            className="cta-button-primary"
                            style={{
                                background: '#3D5AFE', color: 'white', border: 'none', 
                                padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {loading ? 'Adding...' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
