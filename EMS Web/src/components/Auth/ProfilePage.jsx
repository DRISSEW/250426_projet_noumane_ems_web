import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../styles/ProfilePage.css';

const ProfilePage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email') || 'medchennani@gmail.com';
        setUsername(storedUsername || t('notAvailable'));
        setEmail(storedEmail);
    }, [t]);

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="profile-container">
            <button
                className="back-button"
                onClick={() => navigate(-1)}
                title={t('goBack')}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="back-icon">
                    <path d="M10 19l-7-7 7-7v4h8v6h-8v4z" />
                </svg>
            </button>

            <div className="profile-header">
                <div className="avatar-container">
                    <div className="avatar">
                        {getInitials(username)}
                    </div>
                </div>
                <h2>{username}</h2>
            </div>

            <div className="profile-card">
                <h3>{t('personalInformation')}</h3>
                <div className="profile-info">
                    <div className="profile-item">
                        <div className="profile-field">
                            <span className="profile-label">{t('username')}</span>
                            <span className="profile-value">{username}</span>
                        </div>
                        <svg className="field-icon" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <div className="profile-item">
                        <div className="profile-field">
                            <span className="profile-label">{t('email')}</span>
                            <span className="profile-value">{email}</span>
                        </div>
                        <svg className="field-icon" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;