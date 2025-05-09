import React, { useState } from 'react';
import { Edit3, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import './profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleEditDetails = () => {
        navigate("/edit-details");
    };

    return (
        <div className="profile-container">
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="profile-button"
            >
                <img src="/profile_image.png" alt="Profile" className='profileimage'
                />
            </button>

            {/* Dropdown Menu */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                className={`profile-dropdown ${isOpen ? "show" : ""}`}
            >
                <button onClick={handleEditDetails} className="dropdown-button">
                    <Edit3 size={18} /> Edit Details
                </button>
                <button onClick={handleLogout} className="dropdown-button logout-button">
                    <LogOut size={18} /> Logout
                </button>
            </motion.div>
        </div>
    );
};

export default Profile;
