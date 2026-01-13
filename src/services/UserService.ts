import axios from 'axios';
import keycloak from '../auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

const getConfig = () => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keycloak.token}`
        }
    };
};

export const UserService = {
    getBatchUsers: async (ids: string[]): Promise<UserProfile[]> => {
        if (ids.length === 0) return [];
        const response = await axios.post(`${API_BASE_URL}/user/batch`, { ids }, getConfig());
        return response.data;
    },

    getCurrentUser: async (): Promise<UserProfile> => {
        const response = await axios.get(`${API_BASE_URL}/user/me`, getConfig());
        return response.data;
    }
};
