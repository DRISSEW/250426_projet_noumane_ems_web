import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/LoginPage.css';
import { Visibility, VisibilityOff, Brightness4, Brightness7 } from '@mui/icons-material';

const RegisterPage = ({ isDarkMode, toggleTheme }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', formData.username);
        localStorage.setItem('email', formData.email);
        alert('Registration successful!');
        window.location.href = '/login';
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <div className="brand">
                    <img src="/EWlogo.jpg" alt="Electric Wave Logo" className="logo" />
                    <h1>Electric Wave EMS</h1>
                </div>
                <button className="theme-toggle" onClick={toggleTheme}>
                     {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                </button>
            </div>

            <div className="login-form-container">
                <h3>Register</h3>
                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-button">Register</button>
                </form>

                <div className="register-link">
                    <p>Already have an account?  
                        <Link to="/login" className="register-link-text">  Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;