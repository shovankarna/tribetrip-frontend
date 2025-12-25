import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { handleApiResponse } from '../utils/api';
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
    createdAt: string;
    updatedAt: string;
    active: boolean;
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
            .then(res => handleApiResponse(res))
            .then(data => {
                setProfile(data);
                setFormData({ firstName: data.firstName || '', lastName: data.lastName || '' });
            })
            .catch(err => {
                // If it's a handled error, err.message is already clean
                toast.error(err.message || "Failed to fetch profile");
            });
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
            
            const updated = await handleApiResponse(res);
            setProfile(updated);
            setIsEditing(false);
            toast.success("Profile updated successfully");

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="main-content">
                <div className="profile-container">
                    <div className="profile-header">
                        <h2>My Profile</h2>
                        <div className="header-meta">
                             <span className="email-badge">{profile?.email}</span>
                             {profile?.active && <span className="status-badge active">Active</span>}
                        </div>
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
                                <div className="info-row">
                                    <label>Member Since</label>
                                    <p>{profile?.createdAt ? formatDate(profile.createdAt) : <span className="placeholder">N/A</span>}</p>
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
