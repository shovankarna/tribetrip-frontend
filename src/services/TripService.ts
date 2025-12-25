import keycloak from '../auth';
import { handleApiResponse } from '../utils/api';

const API_BASE_URL = '/api'; // Nginx proxy handles this

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

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keycloak.token}`
    };
};

export const TripService = {
    getUserTrips: async (): Promise<Trip[]> => {
        const response = await fetch(`${API_BASE_URL}/trips`, {
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    getTrip: async (tripId: string): Promise<Trip> => {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    createTrip: async (tripData: CreateTripRequest): Promise<Trip> => {
        const response = await fetch(`${API_BASE_URL}/trips`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(tripData)
        });
        return handleApiResponse(response);
    },

    getTripMembers: async (tripId: string): Promise<TripMember[]> => {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    addMember: async (tripId: string, userId: string): Promise<TripMember> => {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId, role: 'MEMBER' }) // Default to MEMBER
        });
        return handleApiResponse(response);
    },

    removeMember: async (tripId: string, userId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}/members/${userId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    // Optional: Get members list if not included in Trip object
    // Assuming we might need a separate endpoint or it's part of Trip details
    // But based on controller, getTrip returns TripResponse which usually includes members or we need to add it?
    // Checking backend: TripMapper doesn't seem to map members list into TripResponse yet?
    // Wait, getTrip in Service returns TripResponse. Backend TripResponse definition?
    // Let's assume for now we might need to fetch members separately OR Backend provides them.
    // Backend `TripController.getTrip` calls `TripService.getTrip` -> `TripMapper.toDto`. 
    // Usually TripResponse has basic fields. 
    // If we need members, we might need an endpoint `GET /api/trips/{tripId}/members`.
    // Currently `TripController` DOES NOT have `getMembers`.
    // So we can only see members via `getTrip` if `TripResponse` includes them?
    // Let's assume we need to add `getTripMembers` to backend or we are blind?
    // Ah, wait. The user request says: "Members Section — REQUIRED... API Used (From your Trip API response or separate endpoint)".
    // I will check TripResponse in backend to be sure. If missing, I will add it or add endpoint.
    // For now, I will implement `getTripMembers` assuming I might need to add it to backend.

    leaveTrip: async (tripId: string, userId: string): Promise<void> => {
        return TripService.removeMember(tripId, userId);
    },

    updateTrip: async (tripId: string, tripData: CreateTripRequest): Promise<Trip> => {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(tripData)
        });
        return handleApiResponse(response);
    },

    deleteTrip: async (tripId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    updateMemberRole: async (tripId: string, userId: string, role: 'ADMIN' | 'MEMBER'): Promise<TripMember> => {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}/members/${userId}/role`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ role })
        });
        return handleApiResponse(response);
    },

    updateTripStatus: async (tripId: string, status: Trip['status']): Promise<Trip> => {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        return handleApiResponse(response);
    }
};
