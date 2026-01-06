import keycloak from '../auth';
import { handleApiResponse } from '../utils/api';

const API_BASE_URL = '/api';

export type ItineraryStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ItineraryTemplateItem {
    id: string;
    templateId: string;
    title: string;
    description?: string;
    defaultDayOffset: number;
    defaultStartTime?: string;
    defaultDurationMinutes?: number;
    locationText?: string;
    notes?: string;
    orderIndex?: number;
}

export interface ItineraryTemplate {
    id: string;
    ownerId: string;
    title: string;
    description?: string;
    status: ItineraryStatus;
    items: ItineraryTemplateItem[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTemplateRequest {
    title: string;
    description?: string;
    status?: ItineraryStatus;
}

export interface UpdateTemplateRequest {
    title?: string;
    description?: string;
    status?: ItineraryStatus;
}

export interface CreateTemplateItemRequest {
    title: string;
    description?: string;
    defaultDayOffset: number;
    defaultStartTime?: string; // "HH:mm" or "HH:mm:ss"
    defaultDurationMinutes?: number;
    locationText?: string;
    notes?: string;
    orderIndex?: number;
}

export interface UpdateTemplateItemRequest {
    title?: string;
    description?: string;
    defaultDayOffset?: number;
    defaultStartTime?: string;
    defaultDurationMinutes?: number;
    locationText?: string;
    notes?: string;
    orderIndex?: number;
}

// Trip Itinerary Types
export interface TripItineraryItem {
    id: string;
    title: string;
    date: string;
    startTime?: string;
    durationMinutes?: number;
    locationText?: string;
    notes?: string;
    orderIndex?: number;
    unscheduled: boolean;
}

export interface TripItinerary {
    id: string;
    tripId: string; // or tripItineraryId
    items: TripItineraryItem[];
}

export interface AddTripItineraryItemRequest {
    title: string;
    date?: string; // Optional if unscheduled?
    startTime?: string;
    durationMinutes?: number;
    locationText?: string;
    notes?: string;
    orderIndex?: number;
    unscheduled?: boolean;
}

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keycloak.token}`
    };
};

export const ItineraryService = {
    // --- Templates ---

    getUserTemplates: async (): Promise<ItineraryTemplate[]> => {
        const response = await fetch(`${API_BASE_URL}/itineraries`, {
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    getTemplate: async (templateId: string): Promise<ItineraryTemplate> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/${templateId}`, {
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    createTemplate: async (data: CreateTemplateRequest): Promise<ItineraryTemplate> => {
        const response = await fetch(`${API_BASE_URL}/itineraries`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleApiResponse(response);
    },

    updateTemplate: async (templateId: string, data: UpdateTemplateRequest): Promise<ItineraryTemplate> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/${templateId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleApiResponse(response);
    },

    deleteTemplate: async (templateId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/${templateId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    publishTemplate: async (templateId: string): Promise<ItineraryTemplate> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/${templateId}/publish`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    archiveTemplate: async (templateId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/${templateId}/archive`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    // --- Template Items ---

    addTemplateItem: async (templateId: string, item: CreateTemplateItemRequest): Promise<ItineraryTemplateItem> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/${templateId}/items`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(item)
        });
        return handleApiResponse(response);
    },

    updateTemplateItem: async (templateId: string, itemId: string, item: UpdateTemplateItemRequest): Promise<ItineraryTemplateItem> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/${templateId}/items/${itemId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(item)
        });
        return handleApiResponse(response);
    },

    deleteTemplateItem: async (templateId: string, itemId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/${templateId}/items/${itemId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    // --- Trip Integration ---

    // --- Trip Integration ---

    attachTemplateToTrip: async (tripId: string, templateId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/trips/${tripId}/attach/${templateId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    getTripItinerary: async (tripId: string): Promise<TripItinerary> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/trips/${tripId}`, {
            headers: getHeaders()
        });
        return handleApiResponse(response);
    },

    // Explicit Trip Item Management (if not managing via template logic only)
    addTripItineraryItem: async (tripId: string, item: AddTripItineraryItemRequest): Promise<TripItineraryItem> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/trips/${tripId}/items`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(item)
        });
        return handleApiResponse(response);
    },

    updateTripItineraryItem: async (tripId: string, itemId: string, item: Partial<AddTripItineraryItemRequest>): Promise<TripItineraryItem> => {
        // Note: Backend endpoint updated to /api/itineraries/trip-items/{itemId}
        // tripId param is technically unused in URL but kept for interface consistency or context if needed later
        const response = await fetch(`${API_BASE_URL}/itineraries/trip-items/${itemId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(item)
        });
        return handleApiResponse(response);
    },

    deleteTripItineraryItem: async (tripId: string, itemId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/itineraries/trip-items/${itemId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleApiResponse(response);
    }
};
