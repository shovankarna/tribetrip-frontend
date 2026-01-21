import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { ItineraryService, type ItineraryTemplate } from '../services/ItineraryService';
import AiPlanningWizard from '../components/itinerary/ai/AiPlanningWizard';
import '../components/itinerary/ai/AiPlanning.css';
import './MyItinerariesPage.css';

import ConfirmationModal from '../components/common/ConfirmationModal';

const MyItinerariesPage = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<ItineraryTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAiWizard, setShowAiWizard] = useState(false);
    const [showCreateDropdown, setShowCreateDropdown] = useState(false);
    
    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
    
    // New Template Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await ItineraryService.getUserTemplates();
            setTemplates(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load itineraries");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await ItineraryService.createTemplate({
                title: newTitle,
                description: newDesc,
                status: 'DRAFT'
            });
            setShowCreateModal(false);
            setNewTitle('');
            setNewDesc('');
            toast.success("Itinerary created!");
            navigate(`/itineraries/${created.id}`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to create itinerary');
        }
    };

    // Open Modal
    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setTemplateToDelete(id);
        setShowDeleteModal(true);
    };

    // Confirm Action
    const confirmDelete = async () => {
        if (!templateToDelete) return;
        
        try {
            await ItineraryService.deleteTemplate(templateToDelete);
            toast.success("Itinerary deleted");
            loadTemplates();
        } catch (err) {
            toast.error("Failed to delete");
        } finally {
            setShowDeleteModal(false);
            setTemplateToDelete(null);
        }
    };

    return (
        <div className="itineraries-page-container">
            <Navbar />
            
            <div className="itineraries-content-wrapper">
                {/* Header */}
                <div className="itineraries-header">
                    <h1 className="itineraries-title">My Itineraries</h1>
                    
                    <div className="create-dropdown-container">
                        <button 
                            className="cta-button" 
                            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                        >
                            + Create Itinerary <span style={{fontSize: '0.8em', marginLeft: '6px'}}>▼</span>
                        </button>
                        
                        {showCreateDropdown && (
                            <div className="create-menu">
                                <div 
                                    className="create-menu-item" 
                                    onClick={() => {
                                        setShowCreateDropdown(false);
                                        setShowCreateModal(true);
                                    }}
                                >
                                    <span>📝</span> Create Manually
                                </div>
                                <div 
                                    className="create-menu-item" 
                                    onClick={() => {
                                        setShowCreateDropdown(false);
                                        setShowAiWizard(true);
                                    }}
                                >
                                    <span style={{ fontSize: '1.1em' }}>✨</span> Plan with AI
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="itineraries-divider"></div>

                {/* Content */}
                {loading ? (
                    <div style={{opacity: 0.6}}>Loading your templates...</div>
                ) : templates.length === 0 ? (
                    <div className="empty-state-view">
                         <h2 className="empty-state-headline">No itineraries yet.</h2>
                         <p className="empty-state-subtext">
                            Start planning your next adventure by creating a reusable itinerary template.
                         </p>
                         <button className="cta-button" onClick={() => setShowAiWizard(true)}>
                            Plan with AI ✨
                         </button>
                         <div style={{marginTop: '10px', fontSize: '0.9rem'}}>
                            or <span style={{color: '#6366f1', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setShowCreateModal(true)}>create manually</span>
                         </div>
                    </div>
                ) : (
                    <div className="itineraries-grid">
                        {templates.map(tpl => (
                            <div 
                                key={tpl.id} 
                                className="i-card"
                                onClick={() => navigate(`/itineraries/${tpl.id}`)}
                            >
                                <div className="i-card-body">
                                    <div className="i-card-header">
                                        <h3 className="i-card-title">{tpl.title}</h3>
                                        <span className="i-card-status">{tpl.status}</span>
                                    </div>
                                    <p className="i-card-desc">
                                        {tpl.description || "No description provided."}
                                    </p>
                                    <div style={{fontSize: '0.8rem', color: '#666'}}>
                                        Items: {tpl.items ? tpl.items.length : 0}
                                    </div>
                                    <div className="i-card-footer">
                                        <button className="icon-btn-text">Edit</button>
                                        <button 
                                            className="icon-btn-text" 
                                            style={{color: '#ff4444', borderColor: '#442222'}}
                                            onClick={(e) => handleDeleteClick(e, tpl.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <Footer />

            {/* AI Wizard */}
            <AiPlanningWizard 
                isOpen={showAiWizard} 
                onClose={() => setShowAiWizard(false)}
                onSuccess={() => {
                    loadTemplates();
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Itinerary"
                message="Are you sure you want to delete this itinerary? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h2 style={{marginTop: 0, color: 'white'}}>New Itinerary Template</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Template Name</label>
                                <input 
                                    className="form-input"
                                    type="text" 
                                    required 
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="e.g. 7 Days in Japan"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea 
                                    className="form-input"
                                    rows={3}
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="Brief overview of this itinerary..."
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyItinerariesPage;
