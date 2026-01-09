import type { Trip, TripRole } from '../services/TripService';

export const canEditTripDetails = (status: Trip['status'], role: TripRole): boolean => {
    if (role !== 'OWNER') return false;
    return ['DRAFT', 'PLANNING', 'CONFIRMED', 'ONGOING'].includes(status);
};

export const canAddMember = (status: Trip['status'], role: TripRole): boolean => {
    if (role !== 'OWNER' && role !== 'ADMIN') return false;
    return ['DRAFT', 'PLANNING', 'CONFIRMED'].includes(status);
};

export const canRemoveMember = (status: Trip['status'], role: TripRole): boolean => {
    if (role !== 'OWNER' && role !== 'ADMIN') return false;
    return ['DRAFT', 'PLANNING'].includes(status);
};

export const canChangeMemberRole = (status: Trip['status'], role: TripRole): boolean => {
    if (role !== 'OWNER' && role !== 'ADMIN') return false;
    return ['DRAFT', 'PLANNING', 'CONFIRMED', 'ONGOING'].includes(status);
};

export const canEditItinerary = (status: Trip['status'], _role: TripRole): boolean => {
    // Assuming Members can edit itinerary? Or just Admin/Owner? 
    // User request says "Allowed: Create / edit / delete itinerary items" for DRAFT.
    // Usually implies participants.
    // For now, let's assume all members can edit if the status allows, or restrict to Admin/Owner if that was previous logic.
    // Previous logic didn't explicitly restrict itinerary by role in the generic list.
    // But typically Owner/Admin.
    // The table just says "Itinerary: ✅" for DRAFT/PLANNING/CONFIRMED/ONGOING.
    // Let's assume validation is Status based mainly.
    return ['DRAFT', 'PLANNING', 'CONFIRMED', 'ONGOING'].includes(status);
};

export const canDeleteTrip = (_status: Trip['status'], role: TripRole): boolean => {
    if (role !== 'OWNER') return false;
    // Can delete in any status? Usually yes, or maybe not if Completed.
    // User didn't specify delete rules explicitly in the table, just "Trip Details".
    // "Edit trip details" -> restricted.
    // "Delete trip" -> drastic.
    // Let's allow Delete for Owner always for now, or maybe restrict in Ongoing/Completed?
    // "Cancelled" is a status. "Delete" is soft-delete.
    // Lets keep it simple: Owner can delete.
    return true;
};

export const canChangeStatus = (status: Trip['status'], role: TripRole): boolean => {
    if (role !== 'OWNER' && role !== 'ADMIN') return false;
    return status !== 'COMPLETED' && status !== 'CANCELLED';
};
