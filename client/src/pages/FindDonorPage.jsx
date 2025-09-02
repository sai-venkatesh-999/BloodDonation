import React, { useState } from 'react';
import apiClient from '../api/axiosConfig'; // Use the configured apiClient
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const DonorCard = ({ donor, onSelect }) => (
    <motion.div 
        className="column is-full-mobile is-half-tablet is-one-third-desktop"
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
    >
        <div className="card donor-card">
            <header className="card-header has-background-danger">
                <p className="card-header-title has-text-white">{donor.full_name}</p>
            </header>
            <div className="card-content">
                <div className="content">
                    <p className="title is-5">Blood Group: <span className="has-text-danger-dark has-text-weight-bold">{donor.blood_group}</span></p>
                    <p><strong><i className="fas fa-map-marker-alt mr-2"></i>Location:</strong> {donor.address}</p>
                </div>
            </div>
            <footer className="card-footer">
                <a href="#" onClick={(e) => { e.preventDefault(); onSelect(donor); }} className="card-footer-item has-text-weight-bold">
                    Request Blood
                </a>
            </footer>
        </div>
    </motion.div>
);


function FindDonorPage() {
    const [filters, setFilters] = useState({ bloodGroup: '', address: '' });
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isModalActive, setIsModalActive] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [hospitalName, setHospitalName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const handleFilterChange = (e) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!filters.bloodGroup) { toast.error('Please select a blood group to search.'); return; }
        setLoading(true); setDonors([]); setHasSearched(true);
        try {
            const { data } = await apiClient.get('/donors/search', {
                params: { bloodGroup: filters.bloodGroup, address: filters.address }
            });
            setDonors(data);
        } catch (err) {
            if (err.response?.status !== 401) {
                toast.error(err.response?.data?.message || 'An error occurred while searching.');
            }
        }
        setLoading(false);
    };
    
    const openRequestModal = (donor) => { setSelectedDonor(donor); setIsModalActive(true); };
    const closeRequestModal = () => { setIsModalActive(false); setSelectedDonor(null); setHospitalName(''); };
    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!hospitalName.trim()) { toast.error("Hospital name is required."); return; }
        setIsSubmitting(true);
        try {
            const { data } = await apiClient.post('/requests/create', { requiredBloodGroup: selectedDonor.blood_group, hospitalName });
            closeRequestModal();
            toast.success(data.message);
        } catch (err) {
            if (err.response?.status !== 401) {
                toast.error(err.response?.data?.message || 'Failed to submit request.');
            }
        }
        setIsSubmitting(false);
    };

    return (
        <>
            <section className="section">
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="title">Find a Blood Donor</h1>
                        <p className="subtitle">Filter available donors by blood group and city.</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <div className="box">
                            <form onSubmit={handleSearch}>
                                <div className="field is-horizontal">
                                    <div className="field-body">
                                        <div className="field">
                                            <label className="label">Blood Group (Required)</label>
                                            <div className="control is-expanded has-icons-left">
                                                <span className="select is-fullwidth">
                                                    <select name="bloodGroup" value={filters.bloodGroup} onChange={handleFilterChange} required>
                                                        <option value="">-- Select --</option>
                                                        {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                    </select>
                                                </span>
                                                <span className="icon is-small is-left"><i className="fas fa-tint"></i></span>
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label className="label">City / Address (Optional)</label>
                                            <div className="control is-expanded has-icons-left">
                                                <input className="input" type="text" name="address" placeholder="e.g. Mumbai" value={filters.address} onChange={handleFilterChange} />
                                                <span className="icon is-small is-left"><i className="fas fa-city"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="field mt-4">
                                    <div className="control">
                                        <button type="submit" className={`button is-primary is-fullwidth is-medium ${loading && 'is-loading'}`} disabled={loading}>
                                            <span className="icon"><i className="fas fa-search"></i></span>
                                            <span>Search for Donors</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                    <div className="mt-5">
                        <div className="columns is-multiline is-variable is-4">
                            <AnimatePresence>
                                {donors.map(donor => (
                                    <DonorCard key={donor.id} donor={donor} onSelect={openRequestModal} />
                                ))}
                            </AnimatePresence>
                        </div>
                        {!loading && hasSearched && donors.length === 0 && (
                            <div className="has-text-centered mt-6">
                                <p className="is-size-4 has-text-weight-bold">No available donors match your criteria.</p>
                                <p>Try broadening your search by removing the city filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            
            <div className={`modal ${isModalActive ? 'is-active' : ''}`}>
                <div className="modal-background" onClick={closeRequestModal}></div>
                <div className="modal-card">
                    <header className="modal-card-head"><p className="modal-card-title">Confirm Blood Request</p><button className="delete" onClick={closeRequestModal}></button></header>
                    <section className="modal-card-body">
                        {selectedDonor && (<><p>You are requesting <strong>{selectedDonor.blood_group}</strong> blood for use at the specified hospital.</p><form id="request-form" onSubmit={handleRequestSubmit}><div className="field mt-4"><label className="label">Hospital Name & Address</label><div className="control"><input className="input" type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required /></div></div></form></>)}
                    </section>
                    <footer className="modal-card-foot"><button className={`button is-success ${isSubmitting && 'is-loading'}`} type="submit" form="request-form" disabled={isSubmitting}>Submit Request</button><button className="button" onClick={closeRequestModal}>Cancel</button></footer>
                </div>
            </div>
        </>
    );
}
export default FindDonorPage;