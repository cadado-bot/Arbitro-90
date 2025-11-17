import React, { useState } from 'react';
import { WhistleBallIcon } from './components/icons';
import { useLanguage } from './LanguageContext';

interface AuthProps {
    onLogin: (username: string, pass: string) => boolean;
    onSignup: (username: string, pass: string) => boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSignup }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { t } = useLanguage();


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        let success = false;
        if (isLogin) {
            success = onLogin(username, password);
            if (!success) setError(t('loginError'));
        } else {
            success = onSignup(username, password);
            if (!success) setError(t('signupError'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg text-dark-text p-4">
             <style>{`
                .input-field { background-color: #1e1e1e; border: 1px solid #3a3a3a; color: #e0e0e0; padding: 10px 14px; border-radius: 6px; }
                .btn-primary { padding: 10px 16px; color: white; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; width: 100%; }
            `}</style>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <WhistleBallIcon className="h-16 w-16 text-brand-green mx-auto" />
                    <h1 className="text-4xl font-bold tracking-wider mt-4">{t('appTitle')} <span className="text-brand-green font-semibold">90º</span></h1>
                </div>
                <div className="bg-dark-surface p-8 rounded-lg shadow-2xl">
                    <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? t('loginTitle') : t('signupTitle')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-dark-text-secondary mb-2">{t('usernameLabel')}</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field w-full"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-dark-text-secondary mb-2">{t('passwordLabel')}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field w-full"
                                required
                                minLength={6}
                            />
                        </div>
                        {error && <p className="text-brand-red text-sm text-center">{error}</p>}
                        <button type="submit" className="btn-primary bg-brand-blue hover:bg-blue-700">
                           {isLogin ? t('loginButton') : t('signupButton')}
                        </button>
                    </form>
                    <p className="text-center text-sm text-dark-text-secondary mt-6">
                       <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-brand-blue hover:underline">
                         {isLogin ? t('switchToSignup') : t('switchTologin')}
                       </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;