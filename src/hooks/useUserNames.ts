import { useState, useEffect } from 'react';
import { UserService } from '../services/UserService';

const nameCache: Record<string, string> = {};
const pendingRequests: Set<string> = new Set();
let listeners: (() => void)[] = [];

const notifyListeners = () => {
    listeners.forEach(l => l());
};

export const useUserNames = (userIds: string[]) => {
    // Force re-render when cache updates
    const [_, setTick] = useState(0);

    useEffect(() => {
        const listener = () => setTick(t => t + 1);
        listeners.push(listener);
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    }, []);

    useEffect(() => {
        const fetchNames = async () => {
            // Filter out IDs that are already cached or currently being fetched
            const uniqueIds = Array.from(new Set(userIds));
            const missingIds = uniqueIds.filter(id => !nameCache[id] && !pendingRequests.has(id) && id);

            if (missingIds.length > 0) {
                missingIds.forEach(id => pendingRequests.add(id));
                try {
                    const users = await UserService.getBatchUsers(missingIds);
                    users.forEach(user => {
                        nameCache[user.id] = `${user.firstName} ${user.lastName}`;
                        pendingRequests.delete(user.id);
                    });
                    notifyListeners();
                } catch (err) {
                    console.error("Failed to fetch user names", err);
                    // Clear pending on error
                    missingIds.forEach(id => pendingRequests.delete(id));
                }
            }
        };

        if (userIds.length > 0) {
            fetchNames();
        }
    }, [JSON.stringify(userIds)]); // Simple array comparison

    // Helper to get name
    const getName = (id: string) => nameCache[id] || id;

    return { names: nameCache, getName };
};
