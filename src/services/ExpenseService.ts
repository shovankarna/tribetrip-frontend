import axios from 'axios';
import keycloak from '../auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

export interface ExpenseParticipant {
    userId: string;
    amountPaid?: number;
    amountOwed?: number;
}

export interface Expense {
    id: string;
    tripId: string;
    title: string;
    description?: string;
    totalAmount: number;
    currency: string;
    expenseDate: string;
    splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
    category?: string;
    createdByUserId: string;
    createdAt: string;
    participants: ExpenseParticipant[];
}

export interface CreateExpenseRequest {
    tripId: string;
    title: string;
    description?: string;
    totalAmount: number;
    currency: string; // 'USD', 'INR', etc.
    expenseDate: string;
    splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
    category?: string;
    participants: ExpenseParticipant[];
}

export interface BalanceResponse {
    userId: string;
    balance: number;
}

export interface SettlementResponse {
    fromUserId: string;
    toUserId: string;
    amount: number;
    currency: string;
}

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keycloak.token}`,
        'X-User-Id': keycloak.subject || '', // For MVP context passing
    };
};

export const ExpenseService = {
    getTripExpenses: async (tripId: string): Promise<Expense[]> => {
        const response = await axios.get(`${API_URL}/expenses`, {
            params: { tripId },
            headers: getHeaders()
        });
        return response.data;
    },

    createExpense: async (request: CreateExpenseRequest): Promise<Expense> => {
        const response = await axios.post(`${API_URL}/expenses`, request, {
            headers: getHeaders()
        });
        return response.data;
    },

    getBalances: async (tripId: string): Promise<BalanceResponse[]> => {
        const response = await axios.get(`${API_URL}/expenses/balances`, {
            params: { tripId },
            headers: getHeaders()
        });
        return response.data;
    },

    getSettlements: async (tripId: string): Promise<SettlementResponse[]> => {
        const response = await axios.get(`${API_URL}/expenses/settlements`, {
            params: { tripId },
            headers: getHeaders()
        });
        return response.data;
    },

    deleteExpense: async (expenseId: string): Promise<void> => {
        await axios.delete(`${API_URL}/expenses/${expenseId}`, {
            headers: getHeaders()
        });
    }
};
