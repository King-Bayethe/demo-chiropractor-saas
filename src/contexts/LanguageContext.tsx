import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  availableLanguages: { code: string; name: string; nativeName: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translation function (can be expanded)
const translations = {
  en: {
    'staff_access_only': 'Staff Access Only',
    'chiropractic_crm_system': 'Chiropractic CRM System',
    'email_address': 'Email Address',
    'password': 'Password',
    'sign_in': 'Sign In',
    'forgot_password': 'Forgot Password?',
    'send_password_reset': 'Send Password Reset Link',
    'new_password': 'New Password',
    'confirm_password': 'Confirm Password',
    'reset_password': 'Reset Password',
    'my_profile': 'My Profile',
    'settings': 'Settings',
    'logout': 'Logout',
  },
  es: {
    'staff_access_only': 'Solo Acceso del Personal',
    'chiropractic_crm_system': 'Sistema CRM Quiropráctico',
    'email_address': 'Dirección de Correo',
    'password': 'Contraseña',
    'sign_in': 'Iniciar Sesión',
    'forgot_password': '¿Olvidaste tu Contraseña?',
    'send_password_reset': 'Enviar Enlace de Restablecimiento',
    'new_password': 'Nueva Contraseña',
    'confirm_password': 'Confirmar Contraseña',
    'reset_password': 'Restablecer Contraseña',
    'my_profile': 'Mi Perfil',
    'settings': 'Configuración',
    'logout': 'Cerrar Sesión',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en');
  const { profile, updateProfile } = useProfile();

  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  ];

  // Initialize language from profile or localStorage
  useEffect(() => {
    if (profile?.language_preference) {
      setLanguageState(profile.language_preference);
    } else {
      const savedLanguage = localStorage.getItem('language_preference') || 'en';
      setLanguageState(savedLanguage);
    }
  }, [profile]);

  const setLanguage = async (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language_preference', newLanguage);
    
    // Update profile if user is logged in
    if (profile) {
      await updateProfile({ language_preference: newLanguage });
    }
  };

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};