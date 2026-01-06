import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ItineraryItemModal from '../components/itinerary/ItineraryItemModal';
import TripSelectorModal from '../components/itinerary/TripSelectorModal';
import EditTemplateModal from '../components/itinerary/EditTemplateModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { ItineraryService, type ItineraryTemplate, type ItineraryTemplateItem } from '../services/ItineraryService';
import './ItineraryEditorPage.css';

const ItineraryEditorPage = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();
    
    const [template, setTemplate] = useState<ItineraryTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ItineraryTemplateItem | undefined>(undefined);
    const [itemModalDefaultDay, setItemModalDefaultDay] = useState(0);

    const [attachModalOpen, setAttachModalOpen] = useState(false);
    
    // Edit Details Modal
    const [editDetailsOpen, setEditDetailsOpen] = useState(false);

    // Confirmation Modals
    const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);


    useEffect(() => {
        if(templateId) loadTemplate(templateId);
    }, [templateId]);

    const loadTemplate = async (id: string) => {
        setLoading(true);
        try {
            const data = await ItineraryService.getTemplate(id);
            setTemplate(data);
        } catch (err) {
            toast.error("Failed to load template");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItem = async (itemData: any) => {
        if (!template) return;
        try {
            if (editingItem) {
                // Update
                await ItineraryService.updateTemplateItem(template.id, editingItem.id, itemData);
                toast.success("Item updated");
            } else {
                // Create
                await ItineraryService.addTemplateItem(template.id, {
                    ...itemData,
                     // UI sends dayOffset, straightforward
                });
                toast.success("Item added");
            }
            loadTemplate(template.id);
        } catch (err) {
            toast.error("Failed to save item");
        }
    };

    const handleDeleteClick = (itemId: string) => {
        setItemToDelete(itemId);
        setConfirmDeleteOpen(true);
    };

    const confirmDeleteItem = async () => {
        if (!template || !itemToDelete) return;
        try {
            await ItineraryService.deleteTemplateItem(template.id, itemToDelete);
            toast.success("Item deleted");
            loadTemplate(template.id);
        } catch (err) {
            toast.error("Failed to delete item");
        } finally {
            setConfirmDeleteOpen(false);
            setItemToDelete(null);
        }
    };

    const handleAttachToTrip = async (tripId: string) => {
        if (!template) return;
        try {
            await ItineraryService.attachTemplateToTrip(tripId, template.id);
            toast.success("Template attached to trip!");
            navigate(`/trips/${tripId}/itinerary`); // Redirect to Workspace
        } catch (err) {
            toast.error("Failed to attach to trip");
            console.error(err);
        }
    };

    const handleUpdateDetails = async (title: string, description: string) => {
        if (!template) return;
        try {
             await ItineraryService.updateTemplate(template.id, { title, description });
             toast.success("Updated!");
             loadTemplate(template.id);
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handlePublish = async () => {
        if (!template) return;
        try {
            await ItineraryService.publishTemplate(template.id);
            toast.success("Published!");
            loadTemplate(template.id);
        } catch (err) {
            toast.error("Publish failed");
        } finally {
            setConfirmPublishOpen(false);
        }
    };

    if (loading) return (
        <div>
            <Navbar />
            <div style={{paddingTop: '100px', textAlign: 'center'}}>Loading template...</div>
        </div>
    );

    if (!template) return <div>Template not found.</div>;

    // Group items by day
    const groupedItems = (template.items || []).reduce((acc, item) => {
        const day = item.defaultDayOffset;
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {} as Record<number, ItineraryTemplateItem[]>);

    // Calculate rendering days
    const offsets = (template.items || []).map(i => i.defaultDayOffset);
    const maxDay = Math.max(0, ...offsets); 
    const days = Array.from({length: maxDay + 1}, (_, i) => i);

    return (
        <div className="editor-page-container">
            <Navbar />
            <div className="editor-content">
                
                {/* Header */}
                <div className="editor-header">
                    <div className="editor-title-row">
                        <div>
                            <h1 className="editor-title">
                                {template.title}
                                <span className={`badge-status ${template.status}`}>{template.status}</span>
                            </h1>
                            <p style={{color: '#AAA', marginTop: '0.5rem'}}>{template.description}</p>
                        </div>
                        <div className="editor-actions">
                            <button className="btn-secondary-sm" onClick={() => setEditDetailsOpen(true)}>
                                Edit Details
                            </button>
                            {template.status === 'DRAFT' && (
                                <button className="btn-primary-sm" onClick={() => setConfirmPublishOpen(true)}>
                                    Publish
                                </button>
                            )}
                            <button className="btn-secondary-sm" onClick={() => setAttachModalOpen(true)}>
                                Attach to Trip
                            </button>
                        </div>
                    </div>
                </div>

                {/* Days List */}
                <div className="itinerary-days">
                    {days.map(dayIndex => {
                        const items = groupedItems[dayIndex] || [];
                        // Sort by time/order
                        items.sort((a, b) => (a.defaultStartTime || '').localeCompare(b.defaultStartTime || ''));

                        return (
                            <div key={dayIndex} className="day-container">
                                <div className="day-header">
                                    <h3 className="day-title">Day {dayIndex + 1}</h3>
                                    <div className="day-actions">
                                        <button 
                                            className="btn-primary-sm"
                                            onClick={() => {
                                                setEditingItem(undefined);
                                                setItemModalDefaultDay(dayIndex);
                                                setItemModalOpen(true);
                                            }}
                                        >
                                            + Add Item
                                        </button>
                                    </div>
                                </div>
                                <div className="day-body">
                                    {items.length === 0 ? (
                                        <div style={{color: '#555', fontStyle: 'italic', fontSize: '0.9rem'}}>No items planned.</div>
                                    ) : (
                                        items.map(item => (
                                            <div key={item.id} className="itinerary-item">
                                                <div className="item-content">
                                                    <h4>{item.title}</h4>
                                                    <div className="item-meta">
                                                        {item.defaultStartTime && <span>⏰ {item.defaultStartTime}</span>}
                                                        {item.locationText && <span>📍 {item.locationText}</span>}
                                                        {item.defaultDurationMinutes && <span>⌛ {item.defaultDurationMinutes} min</span>}
                                                    </div>
                                                    {item.notes && <div className="item-notes">{item.notes}</div>}
                                                </div>
                                                <div className="item-actions">
                                                    <button className="btn-icon" onClick={() => {
                                                        setEditingItem(item);
                                                        setItemModalDefaultDay(dayIndex); // Should item modal use item's day? Yes.
                                                        setItemModalOpen(true);
                                                    }}>✏️</button>
                                                    <button className="btn-icon" onClick={() => handleDeleteClick(item.id)}>🗑️</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Add Day Button */}
                    <div style={{textAlign: 'center', marginTop: '1rem'}}>
                        <button 
                            className="btn-secondary-sm"
                            style={{width: '100%', padding: '1rem', borderStyle: 'dashed'}}
                            onClick={() => {
                                setEditingItem(undefined);
                                setItemModalDefaultDay(maxDay + 1);
                                setItemModalOpen(true);
                            }}
                        >
                            + Add Another Day
                        </button>
                    </div>
                </div>

            </div>
            <Footer />

            {/* Modals */}
            <ItineraryItemModal 
                isOpen={itemModalOpen}
                onClose={() => setItemModalOpen(false)}
                onSave={handleSaveItem}
                initialData={editingItem ? { ...editingItem } : { dayOffset: itemModalDefaultDay }}
                isTripItem={false}
            />

            <TripSelectorModal 
                isOpen={attachModalOpen}
                onClose={() => setAttachModalOpen(false)}
                onSelect={handleAttachToTrip}
            />

            <EditTemplateModal 
                isOpen={editDetailsOpen}
                onClose={() => setEditDetailsOpen(false)}
                onSave={handleUpdateDetails}
                initialTitle={template ? template.title : ''}
                initialDescription={template ? template.description : ''}
            />

            <ConfirmationModal 
                isOpen={confirmPublishOpen}
                onClose={() => setConfirmPublishOpen(false)}
                onConfirm={handlePublish}
                title="Publish Template?"
                message="Publishing makes this template active and available to be attached to trips. You can still edit it later."
            />

            <ConfirmationModal 
                isOpen={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={confirmDeleteItem}
                title="Delete Item?"
                message="Are you sure you want to delete this itinerary item? This action cannot be undone."
                isDestructive={true}
            />
        </div>
    );
};

export default ItineraryEditorPage;
