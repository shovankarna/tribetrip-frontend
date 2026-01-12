import axios from 'axios';
import keycloak from '../auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
    completed: boolean;
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
    completed?: boolean;
}

const getConfig = () => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keycloak.token}`
        }
    };
};

export const ItineraryService = {
    // --- Templates ---

    getUserTemplates: async (): Promise<ItineraryTemplate[]> => {
        const response = await axios.get(`${API_BASE_URL}/itineraries`, getConfig());
        return response.data;
    },

    getTemplate: async (templateId: string): Promise<ItineraryTemplate> => {
        const response = await axios.get(`${API_BASE_URL}/itineraries/${templateId}`, getConfig());
        return response.data;
    },

    createTemplate: async (data: CreateTemplateRequest): Promise<ItineraryTemplate> => {
        const response = await axios.post(`${API_BASE_URL}/itineraries`, data, getConfig());
        return response.data;
    },

    updateTemplate: async (templateId: string, data: UpdateTemplateRequest): Promise<ItineraryTemplate> => {
        const response = await axios.put(`${API_BASE_URL}/itineraries/${templateId}`, data, getConfig());
        return response.data;
    },

    deleteTemplate: async (templateId: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/itineraries/${templateId}`, getConfig());
    },

    publishTemplate: async (templateId: string): Promise<ItineraryTemplate> => {
        const response = await axios.post(`${API_BASE_URL}/itineraries/${templateId}/publish`, {}, getConfig());
        return response.data;
    },

    archiveTemplate: async (templateId: string): Promise<void> => {
        await axios.post(`${API_BASE_URL}/itineraries/${templateId}/archive`, {}, getConfig());
    },

    // --- Template Items ---

    addTemplateItem: async (templateId: string, item: CreateTemplateItemRequest): Promise<ItineraryTemplateItem> => {
        const response = await axios.post(`${API_BASE_URL}/itineraries/${templateId}/items`, item, getConfig());
        return response.data;
    },

    updateTemplateItem: async (templateId: string, itemId: string, item: UpdateTemplateItemRequest): Promise<ItineraryTemplateItem> => {
        const response = await axios.put(`${API_BASE_URL}/itineraries/${templateId}/items/${itemId}`, item, getConfig());
        return response.data;
    },

    deleteTemplateItem: async (templateId: string, itemId: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/itineraries/${templateId}/items/${itemId}`, getConfig());
    },

    // --- Trip Integration ---

    attachTemplateToTrip: async (tripId: string, templateId: string): Promise<void> => {
        await axios.post(`${API_BASE_URL}/itineraries/trips/${tripId}/attach/${templateId}`, {}, getConfig());
    },

    getTripItinerary: async (tripId: string): Promise<TripItinerary> => {
        const response = await axios.get(`${API_BASE_URL}/itineraries/trips/${tripId}`, getConfig());
        return response.data;
    },

    // Explicit Trip Item Management (if not managing via template logic only)
    addTripItineraryItem: async (tripId: string, item: AddTripItineraryItemRequest): Promise<TripItineraryItem> => {
        const response = await axios.post(`${API_BASE_URL}/itineraries/trips/${tripId}/items`, item, getConfig());
        return response.data;
    },

    updateTripItineraryItem: async (itemId: string, item: Partial<AddTripItineraryItemRequest>): Promise<TripItineraryItem> => {
        // Note: Backend endpoint updated to /api/itineraries/trip-items/{itemId}
        const response = await axios.put(`${API_BASE_URL}/itineraries/trip-items/${itemId}`, item, getConfig());
        return response.data;
    },

    deleteTripItineraryItem: async (itemId: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/itineraries/trip-items/${itemId}`, getConfig());
    },

    moveTripItineraryItem: async (tripId: string, itemId: string, newDate: string, newOrderIndex?: number): Promise<void> => {
        await axios.put(`${API_BASE_URL}/itineraries/trips/${tripId}/items/${itemId}/move`, { newDate, newOrderIndex }, getConfig());
    }
};
