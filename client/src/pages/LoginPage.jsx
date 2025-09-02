import React, { useState } from 'react';
import apiClient from '../api/axiosConfig'; // Use the configured apiClient
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await apiClient.post('/auth/login', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard'); 
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        }
    };

    return (
        <section className="section">
            <div className="container">
                <div className="columns is-centered">
                    <div className="column is-one-third">
                        <div className="box">
                            <h1 className="title has-text-centered">Login</h1>
                            {error && <div className="notification is-danger is-light">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="field">
                                    <label className="label">Email</label>
                                    <div className="control"><input className="input" type="email" name="email" onChange={handleChange} required /></div>
                                </div>
                                <div className="field">
                                    <label className="label">Password</label>
                                    <div className="control"><input className="input" type="password" name="password" onChange={handleChange} required /></div>
                                </div>
                                <button className="button is-danger is-fullwidth">Login</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default LoginPage;