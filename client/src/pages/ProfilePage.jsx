import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig'; // Use the configured apiClient
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [donorProfile, setDonorProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
            // Interceptor handles this, but good to have a check.
            navigate('/login');
            return;
        }
        setUser(storedUser);

        const fetchDonorProfile = async () => {
            try {
                const { data } = await apiClient.get('/donors/profile');
                setDonorProfile(data);
            } catch (error) {
                if (error.response?.status !== 401 && error.response?.status !== 404) {
                    toast.error("Could not fetch donor profile.");
                } else if (error.response?.status === 404) {
                    console.log("User is not yet registered as a donor.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDonorProfile();
    }, [navigate]);

    const handleStatusToggle = async (e) => {
        const newStatus = e.target.checked ? 'available' : 'unavailable';
        try {
            const { data } = await apiClient.put('/donors/status', { newStatus });
            setDonorProfile(prev => ({ ...prev, availability_status: newStatus }));
            toast.success(data.message);
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || "Failed to update status.");
            }
            e.target.checked = !e.target.checked;
        }
    };

    if (isLoading) {
        return <section className="section"><progress className="progress is-small is-primary" max="100"></progress></section>;
    }
    
    return (
        <section className="section">
            <motion.div 
                className="container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="columns is-centered">
                    <div className="column is-three-fifths">
                        <div className="box has-text-centered">
                            <figure className="image is-128x128 is-inline-block">
                                <img className="is-rounded" src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName}`} alt="User initial avatar" />
                            </figure>
                            <h1 className="title is-2 mt-4">{user?.fullName}</h1>
                            <h2 className="subtitle is-5">{user?.email}</h2>
                        </div>

                        <div className="box mt-5">
                             <h3 className="title is-4">Account Details</h3>
                             <hr className="mt-2 mb-4" />
                             <div className="content">
                                <p><strong>Phone:</strong> {user?.phoneNumber || 'Not provided'}</p>
                                <p><strong>Address:</strong> {user?.address || 'Not provided'}</p>
                                <div>
                                    <strong>Blood Group:</strong>
                                    <span className="tag is-danger is-medium ml-2">{user?.bloodGroup}</span>
                                </div>
                             </div>
                        </div>

                        <div className="box mt-5">
                            <h3 className="title is-4">Donor Status</h3>
                            <hr className="mt-2 mb-4" />
                            {donorProfile ? (
                                <div className="field">
                                    <input 
                                        id="availabilitySwitch" 
                                        type="checkbox" 
                                        name="availabilitySwitch" 
                                        className="switch is-success is-large"
                                        checked={donorProfile.availability_status === 'available'}
                                        onChange={handleStatusToggle}
                                    />
                                    <label htmlFor="availabilitySwitch" className="is-size-5 ml-3">
                                        {donorProfile.availability_status === 'available' ? 'Available for Donation' : 'Currently Unavailable'}
                                    </label>
                                    <p className="help mt-2">Uncheck this if you are temporarily unable to donate.</p>
                                </div>
                            ) : (
                                <div className="notification is-info is-light">
                                    You are not yet registered as a donor. Visit the dashboard to become a donor.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
export default ProfilePage;