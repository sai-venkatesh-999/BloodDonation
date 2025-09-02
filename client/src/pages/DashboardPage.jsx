import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig'; // Use the configured apiClient
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, subtitle, buttonText, buttonClass, onClick, isLoading, loadingText, iconClass }) => (
    <motion.div 
        className="column is-full-mobile is-one-third-tablet"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
        <div className="card dashboard-card">
            <div className="card-content has-text-centered">
                <div>
                    <p className="title is-4"><span className="icon is-large"><i className={`fas ${iconClass} fa-2x`}></i></span></p>
                    <p className="title is-4 mt-3">{title}</p>
                    <p className="subtitle is-6">{subtitle}</p>
                </div>
                <div className="mt-5">
                    <button className={`button ${buttonClass} is-fullwidth ${isLoading ? 'is-loading' : ''}`} onClick={onClick} disabled={isLoading}>
                        {isLoading ? loadingText : buttonText}
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);

function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isDonorLoading, setIsDonorLoading] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        } else {
            // This case should be handled by the interceptor, but good to have as a fallback.
            navigate('/login');
        }
    }, [navigate]);

    const handleBecomeDonor = async () => {
        if (isDonorLoading) return;
        setIsDonorLoading(true);

        if (!window.confirm("Do you want to register as a blood donor? This will make your profile visible to recipients.")) {
            setIsDonorLoading(false);
            return;
        }
        
        try {
            const { data } = await apiClient.post('/donors/register', {});
            toast.success(data.message);
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error(error.response?.data?.message || 'An error occurred.');
            }
        } finally {
            setIsDonorLoading(false);
        }
    };

    if (!user) {
        return <section className="section"><progress className="progress is-small is-primary" max="100"></progress></section>;
    }
    
    return (
        <section className="section">
            <div className="container">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="title is-1 has-text-centered">Welcome, {user.fullName}!</h1>
                    <h2 className="subtitle is-4 has-text-centered">What would you like to do today?</h2>
                </motion.div>
                
                <div className="columns is-centered is-variable is-5 mt-6">
                    <DashboardCard 
                        title="Donate Blood" 
                        subtitle="Register as a donor and save lives." 
                        buttonText="Become a Donor"
                        buttonClass="is-primary"
                        onClick={handleBecomeDonor} 
                        isLoading={isDonorLoading} 
                        loadingText="Registering..." 
                        iconClass="fa-hand-holding-heart"
                    />
                    <DashboardCard 
                        title="Receive Blood" 
                        subtitle="Find available donors for your need." 
                        buttonText="Find a Donor"
                        buttonClass="is-info"
                        onClick={() => navigate('/find-donor')} 
                        isLoading={false}
                        iconClass="fa-search"
                    />
                    <DashboardCard 
                        title="My Requests" 
                        subtitle="Check the status of your blood requests." 
                        buttonText="Check Status"
                        buttonClass="is-warning"
                        onClick={() => navigate('/my-requests')}
                        isLoading={false}
                        iconClass="fa-list-alt"
                    />
                </div>
            </div>
        </section>
    );
}

export default DashboardPage;