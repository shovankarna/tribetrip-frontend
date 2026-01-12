import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import keycloak from '../auth';
import { ExpenseService } from '../services/ExpenseService';
import type { Expense, BalanceResponse, SettlementResponse } from '../services/ExpenseService';
import { TripService } from '../services/TripService';
import type { TripMember } from '../services/TripService';
import BalanceCards from '../components/expenses/BalanceCards';
import SettlementList from '../components/expenses/SettlementList';
import ExpenseList from '../components/expenses/ExpenseList';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import toast from 'react-hot-toast';

const TripExpensesPage = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();
    
    // State
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [balances, setBalances] = useState<BalanceResponse[]>([]);
    const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
    const [members, setMembers] = useState<TripMember[]>([]);
    const [tripName, setTripName] = useState('Trip');
    const [currentUserRole, setCurrentUserRole] = useState<string>('MEMBER'); // Default to MEMBER
    
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (tripId) loadData();
    }, [tripId]);

    const loadData = async () => {
        if (!tripId) return;
        setLoading(true);
        try {
            const [fetchedExpenses, fetchedBalances, fetchedSettlements, fetchedMembers, fetchedTrip] = await Promise.all([
                ExpenseService.getTripExpenses(tripId),
                ExpenseService.getBalances(tripId),
                ExpenseService.getSettlements(tripId),
                TripService.getTripMembers(tripId),
                TripService.getTrip(tripId)
            ]);
            
            setExpenses(fetchedExpenses);
            setBalances(fetchedBalances);
            setSettlements(fetchedSettlements);
            setMembers(fetchedMembers);
            setTripName(fetchedTrip.name);
            setCurrentUserRole(fetchedTrip.myRole);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load expense data");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await ExpenseService.deleteExpense(expenseId);
            toast.success("Expense deleted");
            loadData();
        } catch (error) {
            toast.error("Failed to delete expense");
        }
    };

    return (
        <div style={{minHeight: '100vh', background: '#121212', color: 'white', display: 'flex', flexDirection: 'column'}}>
            <Navbar />
            
            <div style={{maxWidth: '1200px', margin: '0 auto', width: '90%', padding: '2rem 0', paddingTop: '120px', flex: 1}}>
                
                {/* Header */}
                <div style={{marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <button 
                        onClick={() => navigate(`/trips/${tripId}`)}
                        style={{background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer'}}
                    >
                        ←
                    </button>
                    <div>
                        <div style={{color: '#aaa', fontSize: '0.9rem'}}>{tripName}</div>
                        <h1 style={{margin: 0, fontSize: '1.8rem'}}>Expenses</h1>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            marginLeft: 'auto', background: '#3D5AFE', color: 'white', border: 'none', 
                            padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        + Add Expense
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div>Loading expenses...</div>
                ) : (
                    <>
                        <h3 style={{marginTop: 0, marginBottom: '1rem'}}>Current Balances</h3>
                        <BalanceCards balances={balances} members={members} />
                        
                        <SettlementList settlements={settlements} />
                        
                        <h3 style={{marginBottom: '1rem'}}>All Expenses</h3>
                        <ExpenseList 
                            expenses={expenses} 
                            onDelete={handleDeleteExpense} 
                            currentUserId={keycloak.subject || ''}
                        />
                    </>
                )}
            </div>
            
            <Footer />

            <AddExpenseModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                tripId={tripId || ''}
                members={members}
                onSuccess={loadData}
                currentUserRole={currentUserRole}
                currentUserId={keycloak.subject || ''}
            />
        </div>
    );
};

export default TripExpensesPage;
