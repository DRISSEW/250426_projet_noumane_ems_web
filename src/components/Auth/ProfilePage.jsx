import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../../styles/ProfilePage.css'; // Create a CSS file for styling

const ProfilePage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        // Retrieve user data from localStorage
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email') || 'example@example.com'; // Default email
        setUsername(storedUsername || 'N/A');
        setEmail(storedEmail);
    }, []);

    return (
        <div className="profile-container">
            {/* Back Arrow */}
            <button className="back-button" onClick={() => navigate(-1)} title="Go Back">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="back-icon"
                >
                    <path d="M10 19l-7-7 7-7v4h8v6h-8v4z" />
                </svg>
            </button>

            <h2>My Account</h2>
            <div className="profile-info">
                <div className="profile-item">
                    <span className="profile-label">Username:</span>
                    <span className="profile-value">{username}</span>
                </div>
                <div className="profile-item">
                    <span className="profile-label">Email:</span>
                    <span className="profile-value">{email}</span>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;