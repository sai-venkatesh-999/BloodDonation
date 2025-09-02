import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig'; // Use the configured apiClient

const StatusTag = ({ status }) => {
    let colorClass = '';
    switch (status) {
        case 'pending': colorClass = 'is-warning'; break;
        case 'approved': colorClass = 'is-success'; break;
        case 'rejected': colorClass = 'is-danger'; break;
        case 'completed': colorClass = 'is-info'; break;
        default: colorClass = 'is-light';
    }
    return <span className={`tag is-medium ${colorClass}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

function MyRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyRequests = async () => {
            try {
                const { data } = await apiClient.get('/requests/my-requests');
                setRequests(data);
            } catch (err) {
                if (err.response?.status !== 401) {
                    setError('Failed to fetch your requests.');
                }
            }
            setLoading(false);
        };
        fetchMyRequests();
    }, []);

    if (loading) {
        return <section className="section"><progress className="progress is-small is-primary" max="100"></progress></section>;
    }

    if (error) {
        return <section className="section"><div className="notification is-danger">{error}</div></section>;
    }
    
    return (
        <section className="section">
            <div className="container">
                <h1 className="title">My Blood Requests</h1>
                <h2 className="subtitle">Here is the history and status of all your requests.</h2>

                {requests.length === 0 ? (
                    <div className="notification is-info is-light">
                        You have not made any blood requests yet.
                    </div>
                ) : (
                    <div className="box">
                        <table className="table is-fullwidth is-striped is-hoverable">
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Required Blood Group</th>
                                    <th>Hospital</th>
                                    <th>Date Requested</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td>{req.id}</td>
                                        <td><strong>{req.required_blood_group}</strong></td>
                                        <td>{req.hospital_name}</td>
                                        <td>{new Date(req.created_at).toLocaleString()}</td>
                                        <td><StatusTag status={req.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default MyRequestsPage;