import React, { useEffect, useState } from 'react';
import keycloak from '../auth';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import './ProfilePage.css';

interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (keycloak.authenticated) {
            fetch('/api/user/me', {
                headers: { 'Authorization': `Bearer ${keycloak.token}` }
            })
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setFormData({ firstName: data.firstName || '', lastName: data.lastName || '' });
            })
            .catch(err => console.error("Failed to fetch profile", err));
        }
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/user/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${keycloak.token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                const updated = await res.json();
                setProfile(updated);
                setIsEditing(false);
            } else {
                console.error("Update failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="main-content">
                <div className="profile-container">
                    <div className="profile-header">
                        <h2>My Profile</h2>
                        <span className="email-badge">{profile?.email}</span>
                    </div>

                    <div className="profile-card">
                        {!isEditing ? (
                            <div className="profile-view">
                                <div className="info-row">
                                    <label>First Name</label>
                                    <p>{profile?.firstName || <span className="placeholder">Not set</span>}</p>
                                </div>
                                <div className="info-row">
                                    <label>Last Name</label>
                                    <p>{profile?.lastName || <span className="placeholder">Not set</span>}</p>
                                </div>
                                <div className="action-row">
                                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button> 
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} className="profile-form">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.firstName}
                                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.lastName}
                                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                                <div className="action-row">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button type="submit" isLoading={loading}>Save Changes</Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
