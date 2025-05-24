import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../styles/LoginPage.css';
import { loginUser } from '../../services/authService';
import { Visibility, VisibilityOff, Brightness4, Brightness7 } from '@mui/icons-material';
import LanguageSelector from '../LanguageSelector';

const LoginPage = ({ isDarkMode, toggleTheme }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { success, sessionid, message } = await loginUser(formData.username, formData.password);

      if (success) {
        localStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', formData.username);
        localStorage.setItem('sessionId', sessionid);
        window.dispatchEvent(new Event('auth-change'));

        navigate('/dashboard/', { replace: true });
      } else {
        setError(message || t('login.invalidCredentials'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || t('login.serverError'));
      setFormData((prev) => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="brand">
          <img src="/darklogo.png" alt="Electric Wave Logo" className="logo" />
        </div>
        <div className="header-controls">
          <LanguageSelector />
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </button>
        </div>
      </div>

      <div className="login-form-container">
        <h3>{t('login.title')}</h3>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">{t('login.username')}</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder={t('login.enterUsername')}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('login.password')}</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder={t('login.enterPassword')}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? t('login.loggingIn') : t('login.loginButton')}
          </button>
        </form>
        <div className="register-link">
          <p>
            {t('login.noAccount')}{' '}
            <a href="http://electricwave.ma/energymonitoring/" className="register-link-text">
              {t('login.registerHere')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
