import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import apiClient from '../api/axiosConfig'; // Use the configured apiClient
import ScrollToBottom from 'react-scroll-to-bottom';
import { toast } from 'react-toastify';
import './Chat.css';

function ChatPage() {
    const { requestId } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    
    const socket = useMemo(() => io.connect("http://localhost:5000"), []);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser) {
            toast.error("You must be logged in to chat.");
            navigate('/login');
            return;
        }
        setUser(currentUser);

        socket.emit("join_room", requestId);

        const messageListener = (data) => { setMessageList((list) => [...list, data]); };
        socket.on("receive_message", messageListener);

        const fetchHistory = async () => {
            try {
                const { data } = await apiClient.get(`/chat/messages/${requestId}`);
                setMessageList(data);
            } catch (error) {
                if (error.response?.status !== 401) {
                    toast.error("Could not load message history.");
                }
            }
        };
        fetchHistory();

        return () => { 
            socket.off("receive_message", messageListener);
            // It's also good practice to leave the room when the component unmounts
            socket.emit("leave_room", requestId);
        };
    }, [requestId, navigate, socket]);

    const sendMessage = async () => {
        if (currentMessage.trim() !== "" && user) {
            const messageData = {
                roomId: requestId,
                sender_id: user.id, // Use sender_id to be consistent
                message: currentMessage,
                timestamp: new Date().toISOString(),
            };
            
            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };
    
    return (
        <div className="section">
            <div className="chat-window">
                <div className="chat-header"><p>Live Chat - Request #{requestId}</p></div>
                <div className="chat-body">
                    <ScrollToBottom className="message-container">
                        {messageList.map((msg, index) => (
                            <div 
                                key={index} 
                                className="message" 
                                id={user && user.id === msg.sender_id ? "you" : "other"}
                            >
                                <div className="message-content"><p>{msg.message}</p></div>
                            </div>
                        ))}
                    </ScrollToBottom>
                </div>
                <div className="chat-footer">
                    <input
                        type="text"
                        value={currentMessage}
                        placeholder="Type a message..."
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => { if (e.key === "Enter") sendMessage(); }}
                    />
                    <button onClick={sendMessage}><i className="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;