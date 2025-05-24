import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GB, FR } from 'country-flag-icons/react/3x2';

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('en');

    useEffect(() => {
        const storedLanguage = localStorage.getItem('i18nextLng') || 'en';
        setCurrentLanguage(storedLanguage);

        if (!i18n.language || i18n.language === 'dev') {
            i18n.changeLanguage('en');
            setCurrentLanguage('en');
        }
    }, [i18n]);

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
        setCurrentLanguage(language);
        localStorage.setItem('i18nextLng', language);
        setIsOpen(false);
    };

    const currentFlag = currentLanguage === 'en' ? <GB /> : <FR />;
    const otherLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    const otherFlag = currentLanguage === 'en' ? <FR /> : <GB />;
    const otherLabel = currentLanguage === 'en' ? 'Français' : 'English';


    return (
        <div className="language-selector-container">
            <button
                className="language-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
            >
                <span className="flag-icon">{currentFlag}</span>
            </button>

            {isOpen && (
                <button
                    className="language-option"
                    onClick={() => changeLanguage(otherLanguage)}
                >
                    <span className="flag-icon">{otherFlag}</span>
                    <span className="language-label">{otherLabel}</span>
                </button>
            )}
        </div>
    );
};

export default LanguageSelector;