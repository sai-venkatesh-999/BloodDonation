import React, { useState } from 'react';
import apiClient from '../api/axiosConfig'; // Use the configured apiClient
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function RegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({email: '', otp: '', password: '', fullName: '', phoneNumber: '', address: '', bloodGroup: ''});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSendOtp = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await apiClient.post('/auth/send-otp', { email: formData.email });
            toast.info(`An OTP has been sent to ${formData.email}`);
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP email.');
        }
        setLoading(false);
    };
    
    const handleRegister = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            await apiClient.post('/auth/register', formData);
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed.');
        }
        setLoading(false);
    };

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <section className="section">
            <div className="container">
                <div className="columns is-centered">
                    <div className="column is-half">
                        <div className="box">
                            <h1 className="title has-text-centered">Register</h1>
                            {step === 1 ? (
                                <form onSubmit={handleSendOtp}>
                                    <div className="field">
                                        <label className="label">Email Address</label>
                                        <div className="control has-icons-left"><input className="input" type="email" name="email" onChange={handleChange} required /><span className="icon is-small is-left"><i className="fas fa-envelope"></i></span></div>
                                    </div>
                                    <button className={`button is-danger is-fullwidth mt-3 ${loading && 'is-loading'}`}>Get OTP</button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegister}>
                                    <p className="has-text-centered mb-4">An OTP was sent to <strong>{formData.email}</strong>.</p>
                                    <div className="field"><label className="label">OTP</label><div className="control"><input className="input" type="text" name="otp" onChange={handleChange} required /></div></div>
                                    <div className="field"><label className="label">Full Name</label><div className="control"><input className="input" type="text" name="fullName" onChange={handleChange} required /></div></div>
                                    <div className="field"><label className="label">Password</label><div className="control"><input className="input" type="password" name="password" onChange={handleChange} required /></div></div>
                                    <div className="field"><label className="label">Phone Number</label><div className="control"><input className="input" type="tel" name="phoneNumber" onChange={handleChange} required /></div></div>
                                    <div className="field"><label className="label">Address (City)</label><div className="control"><input className="input" type="text" name="address" onChange={handleChange} required /></div></div>
                                    <div className="field"><label className="label">Blood Group</label><div className="control"><div className="select is-fullwidth"><select name="bloodGroup" onChange={handleChange} required><option value="">Select BG</option>{bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}</select></div></div></div>
                                    <button className={`button is-danger is-fullwidth ${loading && 'is-loading'}`}>Register</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default RegisterPage;