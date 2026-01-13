import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
    DragOverlay,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';

import Navbar from '../components/common/Navbar';
import { TripService, type Trip } from '../services/TripService';
import { ItineraryService, type TripItinerary, type TripItineraryItem } from '../services/ItineraryService';
import ItineraryItemModal from '../components/itinerary/ItineraryItemModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { SortableItem } from '../components/common/SortableItem';
import './TripItineraryPage.css';

const TripItineraryPage = () => {
    const { tripId } = useParams();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TripItineraryItem | undefined>(undefined);
    const [modalDefaultDate, setModalDefaultDate] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // DnD State
    const [activeId, setActiveId] = useState<string | null>(null);
    const [items, setItems] = useState<TripItineraryItem[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (tripId) fetchData();
    }, [tripId]);

    useEffect(() => {
        if (itinerary) {
             // Sort by orderIndex initially
             const sorted = [...itinerary.items].sort((a,b) => (a.orderIndex || 0) - (b.orderIndex || 0));
             setItems(sorted);
        }
    }, [itinerary]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const tripData = await TripService.getTrip(tripId!);
            setTrip(tripData);

            try {
                const itineraryData = await ItineraryService.getTripItinerary(tripId!);
                setItinerary(itineraryData);
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    // Itinerary doesn't exist yet, separate handling
                    setItinerary({
                        id: 'virtual-new', 
                        tripId: tripId!, 
                        items: []
                    } as any);
                } else {
                    console.error(err);
                    toast.error("Failed to load trip itinerary");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load trip details");
        } finally {
            setLoading(false);
        }
    };

    const isReadOnly = () => {
        if (!trip) return true;
        const { status, myRole } = trip;
        if (status === 'COMPLETED' || status === 'CANCELLED') return true;
        return !(myRole === 'OWNER' || myRole === 'ADMIN');
    };

    const handleSaveItem = async (itemData: any) => {
        if (!tripId) return;
        try {
            if (editingItem) {
                await ItineraryService.updateTripItineraryItem(editingItem.id, itemData); 
                toast.success("Item updated");
            } else {
                await ItineraryService.addTripItineraryItem(tripId, itemData);
                toast.success("Item added");
            }
            fetchData();
        } catch (err) {
            toast.error("Failed to save item");
        }
    };

    const handleDeleteClick = (itemId: string) => {
        setItemToDelete(itemId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!tripId || !itemToDelete) return;
        try {
            await ItineraryService.deleteTripItineraryItem(itemToDelete);
            toast.success("Item deleted");
            fetchData();
        } catch (err) {
            toast.error("Failed to delete");
        } finally {
            setItemToDelete(null);
        }
    };

    const handleToggleComplete = async (item: TripItineraryItem) => {
        if (!tripId || !item || !itinerary) return;
        
        const updatedItems = items.map(i => 
            i.id === item.id ? { ...i, completed: !i.completed } : i
        );
        setItems(updatedItems); // Optimistic

        try {
            await ItineraryService.updateTripItineraryItem(item.id, {
                completed: !item.completed
            });
        } catch (err) {
            toast.error("Failed to update status");
            fetchData(); // Revert
        }
    };

    // --- Drag and Drop Logic ---

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = items.find(i => i.id === activeId);
        // Over could be an item OR a date container (if empty)
        // We'll treat date containers as having id = date string
        const isOverDateContainer = !items.find(i => i.id === overId);
        const overItem = items.find(i => i.id === overId);

        if (!isActiveTask) return;

        const activeDate = isActiveTask.date;
        const overDate = isOverDateContainer ? overId : overItem?.date;

        if (activeDate !== overDate) {
            setItems((items) => {
                 return items.map(item => {
                     if (item.id === activeId) {
                         return { ...item, date: overDate as string };
                     }
                     return item;
                 });
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;
        
        const activeItem = items.find(i => i.id === activeId);
        if(!activeItem) return;

        // Final Date derived from local items state (updated in DragOver)
        // Check if order changed within same list
        // Or if we need to commit the new date
        
        // Logic to determine newDate based on drop target (over)
        let newDate = '';
        const overItem = items.find(i => i.id === overId);
        
        // If we dropped over an Item, use that item's date
        if (overItem) {
            newDate = overItem.date;
        } else {
            // We dropped over a Container (the ID is the date string)
            newDate = overId;
        }

        // Just in case (fallback)
        if (!newDate) {
             const itemInState = items.find(i => i.id === activeId);
             if (itemInState) newDate = itemInState.date;
        }
        
        // Reorder locally if needed (SortableContext handles visual, but we need meaningful index)
        // Actually active.id and over.id might be in the same day list
        // If sorting usage:
        
        let newItems = [...items];
        const oldIndex = items.findIndex(i => i.id === activeId);
        const newIndex = items.findIndex(i => i.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1 && items[oldIndex].date === items[newIndex].date) {
            newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);
        }

        // --- API Call ---
        // Calculate Order Index based on new position in that day
        const dayItems = newItems.filter(i => i.date === newDate);
        const newOrderIndex = dayItems.findIndex(i => i.id === activeId);

        console.log("Moving item", activeItem.title, "to", newDate, "index", newOrderIndex);

        try {
             await ItineraryService.moveTripItineraryItem(tripId!, activeId, newDate, newOrderIndex);
             // If ONGOING and different date, backend creates Placeholder.
             // We should refresh to see it.
             toast.success("Item moved");
             fetchData(); 
        } catch (e) {
            toast.error("Failed to move item");
            fetchData(); // Revert
        }
    };

    if (loading && !trip) return <div style={{paddingTop: '100px', textAlign: 'center', color: 'white'}}>Loading...</div>;
    if (!trip) return <div style={{paddingTop: '100px', textAlign: 'center', color: 'white'}}>Trip not found</div>;

    const readOnly = isReadOnly();

    // Group items for rendering
    const groupedItems = items.reduce((acc, item) => {
        const date = item.date; 
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {} as Record<string, TripItineraryItem[]>);

    let displayDates: string[] = [];
    if (trip.startDate && trip.endDate) {
        let current = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        while (current <= end) {
            displayDates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
    } else {
        displayDates = Object.keys(groupedItems).sort();
        if (displayDates.length === 0) displayDates = [new Date().toISOString().split('T')[0]];
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return {
            day: d.toLocaleDateString(undefined, { weekday: 'long' }),
            date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        };
    };

    const canCompleteItems = () => {
        if (!trip) return false;
        // Allow Owner/Admin to toggle completion in any status
        const isOwnerOrAdmin = trip.myRole === 'OWNER' || trip.myRole === 'ADMIN';
        return isOwnerOrAdmin;
    };

    const renderItem = (item: TripItineraryItem, isOverlay = false) => {
        
        return (
            <div className={`activity-card ${item.completed ? 'completed' : ''} ${isOverlay ? 'dragging' : ''}`} onClick={() => {
                setEditingItem(item);
                setModalDefaultDate(item.date);
                setItemModalOpen(true);
            }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'flex-start'}}>
                    <div style={{display:'flex', gap: '0.8rem', alignItems: 'flex-start'}}>
                         {/* Checkbox */}
                         <div 
                                onClick={(e) => {
                                    if(canCompleteItems()) {
                                        e.stopPropagation();
                                        handleToggleComplete(item);
                                    }
                                }}
                                style={{
                                    marginTop: '3px',
                                    cursor: canCompleteItems() ? 'pointer' : 'default',
                                    minWidth: '24px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                             >
                                 {item.completed ? (
                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="4" fill="rgba(76, 175, 80, 0.1)"></rect>
                                        <path d="M9 12l2 2 4-4"></path>
                                     </svg>
                                 ) : (
                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                         <rect x="3" y="3" width="18" height="18" rx="4"></rect>
                                     </svg>
                                 )}
                             </div>

                        <div style={{
                            opacity: (item.completed) ? 0.6 : 1, 
                            textDecoration: item.completed ? 'line-through' : 'none',
                            color: (item.completed) ? '#aaa' : 'inherit'
                        }}>
                            <div className="activity-time">{item.startTime || 'All Day'} {item.durationMinutes ? `• ${item.durationMinutes}m` : ''}</div>
                            <div className="activity-title">{item.title}</div>
                            {item.locationText && (
                                <div className="activity-location" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <a 
                                        href={item.locationText.startsWith('http') ? item.locationText : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.locationText)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        title="Open in Maps"
                                        style={{
                                            display: 'inline-flex', 
                                            alignItems: 'center',
                                            color: '#64B5F6', // A nice blue for links
                                            textDecoration: 'none',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: 'rgba(33, 150, 243, 0.1)', // Light blue background
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            border: '1px solid rgba(33, 150, 243, 0.2)'
                                        }}
                                    >
                                        Map ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                    {!readOnly && (
                        <button className="btn-icon" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item.id);
                        }} style={{opacity: 0.6}}>X</button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="workspace-container">
            <Navbar />
            
            {readOnly && (
                <div className="readonly-banner">
                    View Only Mode ({trip.status === 'COMPLETED' ? 'Trip Completed' : 'Restricted Access'})
                </div>
            )}

            <div className="workspace-header">
                <div className="workspace-title">
                    <h1>{trip?.name}</h1>
                    <div className="workspace-meta">
                        <span>📅 {trip?.startDate} to {trip?.endDate}</span>
                        <span>📍 {trip?.destination}</span>
                        <span className="workspace-status">{trip?.status}</span>
                    </div>
                </div>
                <div>
                    {!readOnly && (
                         <button className="add-activity-btn" style={{background: 'white', color: 'black', border: 'none', fontWeight: 600}} onClick={() => {
                             setEditingItem(undefined);
                             setModalDefaultDate(trip?.startDate || '');
                             setItemModalOpen(true);
                         }}>
                            + Add Activity
                         </button>
                    )}
                </div>
            </div>

            <div className="workspace-body">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="timeline-view">
                        {displayDates.map(dateStr => {
                            const { day, date } = formatDate(dateStr);
                            const dayItems = groupedItems[dateStr] || [];
                            // Ensure dayItems sorted by orderIndex if needed, though they come from `items` which we maintain?
                            // Actually items state should drive this.
                            
                            return (
                                <div key={dateStr} className="timeline-day">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-day-header">
                                        <span className="timeline-date">{date}</span>
                                        <span className="timeline-weekday">{day}</span>
                                    </div>
                                    
                                    <SortableContext 
                                        items={dayItems.map(i => i.id)}
                                        strategy={verticalListSortingStrategy}
                                        id={dateStr} // Droppable ID
                                    >
                                        <div className="timeline-items" style={{minHeight: '50px'}}>
                                            {dayItems.map(item => (
                                                <SortableItem key={item.id} id={item.id} disabled={readOnly}>
                                                    {renderItem(item)}
                                                </SortableItem>
                                            ))}
                                            
                                            {/* Empty placeholder for dropping? handled by SortableContext/droppable id */}
                                            {dayItems.length === 0 && !readOnly && (
                                                <div className="empty-slot-hint">Drop here</div>
                                            )}

                                            {!readOnly && (
                                                <button className="add-activity-btn" style={{marginTop: '0.5rem'}} onClick={() => {
                                                    setEditingItem(undefined);
                                                    setModalDefaultDate(dateStr);
                                                    setItemModalOpen(true);
                                                }}>
                                                    + Add Item
                                                </button>
                                            )}
                                        </div>
                                    </SortableContext>
                                </div>
                            );
                        })}
                    </div>

                    {/* Correct implementation of Out of Range Section */}
                    {(() => {
                        const outOfRangeItems = items.filter(i => {
                                if (!trip?.startDate || !trip.endDate) return false;
                                return i.date < trip.startDate || i.date > trip.endDate;
                        });

                        if (outOfRangeItems.length === 0) return null;

                        return (
                            <div className="timeline-day" style={{marginTop: '3rem', borderTop: '2px dashed #444', paddingTop: '2rem'}}>
                                <div className="timeline-day-header" style={{opacity: 0.7}}>
                                    <span className="timeline-date" style={{color: '#ffab40'}}>Unscheduled</span>
                                    <span className="timeline-weekday" style={{fontSize: '0.8rem'}}>(Outside Trip Dates)</span>
                                </div>
                                
                                <SortableContext 
                                    items={outOfRangeItems.map(i => i.id)}
                                    strategy={verticalListSortingStrategy}
                                    id="out-of-range"
                                >
                                    <div className="timeline-items" style={{minHeight: '50px'}}>
                                        {outOfRangeItems.map(item => (
                                            <SortableItem key={item.id} id={item.id} disabled={readOnly}>
                                                {renderItem(item)}
                                            </SortableItem>
                                        ))}
                                    </div>
                                </SortableContext>
                            </div>
                        );
                    })()}

                    <DragOverlay>
                        {activeId ? renderItem(items.find(i => i.id === activeId)!, true) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <ItineraryItemModal 
                isOpen={itemModalOpen}
                onClose={() => setItemModalOpen(false)}
                onSave={handleSaveItem}
                initialData={editingItem ? { ...editingItem } : { date: modalDefaultDate }}
                isTripItem={true}
                readOnly={readOnly}
            />

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Activity"
                message="Are you sure you want to delete this activity? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
};

export default TripItineraryPage;
