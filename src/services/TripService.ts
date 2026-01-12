import axios from 'axios';
import keycloak from '../auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type TripRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface Trip {
    id: string;
    name: string;
    description?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    status: 'DRAFT' | 'PLANNING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    myRole: TripRole;
}

export interface TripMember {
    id: string;
    tripId: string;
    userId: string;
    role: TripRole;
    active: boolean;
    joinedAt: string;
}

export interface CreateTripRequest {
    name: string;
    description?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
}

const getConfig = () => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keycloak.token}`
        }
    };
};

export const TripService = {
    getUserTrips: async (): Promise<Trip[]> => {
        const response = await axios.get(`${API_BASE_URL}/trips`, getConfig());
        return response.data;
    },

    getTrip: async (tripId: string): Promise<Trip> => {
        const response = await axios.get(`${API_BASE_URL}/trips/${tripId}`, getConfig());
        return response.data;
    },

    createTrip: async (tripData: CreateTripRequest): Promise<Trip> => {
        const response = await axios.post(`${API_BASE_URL}/trips`, tripData, getConfig());
        return response.data;
    },

    getTripMembers: async (tripId: string): Promise<TripMember[]> => {
        const response = await axios.get(`${API_BASE_URL}/trips/${tripId}/members`, getConfig());
        return response.data;
    },

    addMember: async (tripId: string, userId: string): Promise<TripMember> => {
        const response = await axios.post(`${API_BASE_URL}/trips/${tripId}/members`, { userId, role: 'MEMBER' }, getConfig());
        return response.data;
    },

    removeMember: async (tripId: string, userId: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/trips/${tripId}/members/${userId}`, getConfig());
    },

    leaveTrip: async (tripId: string, userId: string): Promise<void> => {
        return TripService.removeMember(tripId, userId);
    },

    updateTrip: async (tripId: string, tripData: CreateTripRequest): Promise<Trip> => {
        const response = await axios.put(`${API_BASE_URL}/trips/${tripId}`, tripData, getConfig());
        return response.data;
    },

    deleteTrip: async (tripId: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/trips/${tripId}`, getConfig());
    },

    updateMemberRole: async (tripId: string, userId: string, role: 'ADMIN' | 'MEMBER'): Promise<TripMember> => {
        const response = await axios.put(`${API_BASE_URL}/trips/${tripId}/members/${userId}/role`, { role }, getConfig());
        return response.data;
    },

    updateTripStatus: async (tripId: string, status: Trip['status']): Promise<Trip> => {
        const response = await axios.put(`${API_BASE_URL}/trips/${tripId}/status`, { status }, getConfig());
        return response.data;
    }
};
