import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig'; // Use the configured apiClient
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

function AdminDashboardPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') { navigate('/dashboard'); }
    }, [navigate]);
    
    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const { data } = await apiClient.get('/admin/requests');
                setRequests(data);
            } catch (err) {
                // The interceptor will handle 401, but we can still toast other errors.
                if (err.response?.status !== 401) {
                    toast.error('Failed to fetch requests.');
                }
            }
            setLoading(false);
        };
        fetchRequests();
    }, []);

    const handleProcessRequest = async (requestId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

        const originalRequests = [...requests];
        setRequests(prev => prev.filter(req => req.id !== requestId));

        try {
            const { data } = await apiClient.put(`/admin/requests/${requestId}/${action}`);
            toast.success(data.message);
        } catch (err) {
            setRequests(originalRequests);
            if (err.response?.status !== 401) {
                toast.error(err.response?.data?.message || `Failed to ${action} the request.`);
            }
        }
    };

    if (loading) {
        return <div className="section"><progress className="progress is-small is-primary" max="100"></progress></div>;
    }

    return (
        <section className="section">
            <div className="container">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="title">Admin Dashboard</h1>
                    <h2 className="subtitle">Pending Blood Requests</h2>
                </motion.div>

                <AnimatePresence>
                    {requests.length === 0 ? (
                        <motion.div key="empty-state" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                            <div className="hero is-light mt-5">
                                <div className="hero-body has-text-centered">
                                    <p className="title"><span className="icon is-large has-text-success"><i className="fas fa-check-circle fa-2x"></i></span></p>
                                    <p className="title is-4">All Clear!</p>
                                    <p className="subtitle is-6">There are no pending requests to review.</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="table-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                            <div className="box">
                                <table className="table is-striped is-fullwidth is-hoverable">
                                    <thead><tr><th>ID</th><th>Recipient</th><th>Blood Group</th><th>Hospital</th><th>Date</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {requests.map(req => (
                                                <motion.tr key={req.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                                                    <td>{req.id}</td>
                                                    <td>{req.recipient_name} ({req.recipient_email})</td>
                                                    <td><span className="tag is-danger is-medium">{req.required_blood_group}</span></td>
                                                    <td>{req.hospital_name}</td>
                                                    <td>{new Date(req.created_at).toLocaleString()}</td>
                                                    <td>
                                                        <div className="buttons are-small">
                                                            <button className="button is-success" onClick={() => handleProcessRequest(req.id, 'approve')}><span className="icon is-small"><i className="fas fa-check"></i></span><span>Approve</span></button>
                                                            <button className="button is-danger" onClick={() => handleProcessRequest(req.id, 'reject')}><span className="icon is-small"><i className="fas fa-times"></i></span><span>Reject</span></button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
export default AdminDashboardPage;