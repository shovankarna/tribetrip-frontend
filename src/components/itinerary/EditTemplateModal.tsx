import React, { useState, useEffect } from 'react';

interface EditTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, description: string) => Promise<void>;
    initialTitle: string;
    initialDescription?: string;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialTitle, 
    initialDescription = '' 
}) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
            setDescription(initialDescription);
        }
    }, [isOpen, initialTitle, initialDescription]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(title, description);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
            <div style={{
                background: '#1E1E1E', padding: '2rem', borderRadius: '12px', 
                width: '100%', maxWidth: '500px', border: '1px solid #333', color: 'white'
            }}>
                <h2 style={{marginTop: 0}}>Edit Template Details</h2>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <div>
                        <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Title</label>
                        <input 
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                        />
                    </div>
                    <div>
                        <label style={{display: 'block', color: '#AAA', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Description</label>
                        <textarea 
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            style={{width: '100%', padding: '0.75rem', background: '#2C2C2C', border: '1px solid #444', color: 'white', borderRadius: '6px'}}
                        />
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem'}}>
                        <button type="button" onClick={onClose} style={{background: 'transparent', border: '1px solid #444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: 'pointer'}}>Cancel</button>
                        <button type="submit" disabled={saving} style={{background: 'white', border: 'none', color: 'black', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'}}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTemplateModal;
