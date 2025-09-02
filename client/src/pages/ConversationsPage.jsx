import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig'; // Use the configured apiClient
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

function ConversationsPage() {
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) {
            // This is a fallback; the interceptor should handle most cases.
            toast.error("You must be logged in to view chats.");
            navigate('/login');
            return;
        }
        setUser(currentUser);

        const fetchConversations = async () => {
            try {
                const { data } = await apiClient.get('/chat/conversations');
                setConversations(data);
            } catch (error) {
                if (error.response?.status !== 401) {
                    toast.error("Failed to load your conversations.");
                }
            }
            setIsLoading(false);
        };
        
        fetchConversations();
    }, [navigate]);

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
                <h1 className="title">My Chats</h1>
                <p className="subtitle">Here are all your active conversations for approved blood requests.</p>
                <hr/>
                {conversations.length > 0 ? (
                    <div className="columns is-multiline">
                        {conversations.map(convo => {
                            const otherPerson = user && user.fullName === convo.recipient_name 
                                ? convo.donor_name 
                                : convo.recipient_name;
                            
                            return (
                                <motion.div key={convo.id} className="column is-one-third" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    <div className="box">
                                        <p className="title is-5">Chat with {otherPerson || 'User'}</p>
                                        <p className="subtitle is-6">Request for <strong>{convo.required_blood_group}</strong> blood</p>
                                        <Link to={`/chat/${convo.id}`} className="button is-primary is-fullwidth mt-4">
                                            <span className="icon"><i className="fas fa-comments"></i></span>
                                            <span>Open Chat</span>
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="notification is-info is-light has-text-centered">
                        <p className="is-size-5">You have no active chats.</p>
                        <p>A chat will appear here once a blood request you've made or been assigned to is approved by an admin.</p>
                    </div>
                )}
            </motion.div>
        </section>
    );
}

export default ConversationsPage;