import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  availableLanguages: { code: string; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Enhanced translation system with more comprehensive coverage
const translations = {
  en: {
    // Navigation & General
    'dashboard': 'Dashboard',
    'patients': 'Patients',
    'appointments': 'Appointments',
    'calendar': 'Calendar',
    'conversations': 'Conversations',
    'opportunities': 'Opportunities',
    'soap_notes': 'SOAP Notes',
    'forms': 'Forms',
    'settings': 'Settings',
    'my_profile': 'My Profile',
    'logout': 'Logout',
    'search': 'Search',
    'filter': 'Filter',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'create': 'Create',
    'update': 'Update',
    'view': 'View',
    'close': 'Close',
    'loading': 'Loading...',
    'submit': 'Submit',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'yes': 'Yes',
    'no': 'No',
    
    // Authentication
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
    
    // Patient Management
    'patient_name': 'Patient Name',
    'patient_email': 'Patient Email',
    'patient_phone': 'Patient Phone',
    'date_of_birth': 'Date of Birth',
    'gender': 'Gender',
    'address': 'Address',
    'medical_history': 'Medical History',
    'current_medications': 'Current Medications',
    'allergies': 'Allergies',
    'emergency_contact': 'Emergency Contact',
    'insurance_information': 'Insurance Information',
    
    // Medical Terms
    'chief_complaint': 'Chief Complaint',
    'diagnosis': 'Diagnosis',
    'treatment_plan': 'Treatment Plan',
    'vital_signs': 'Vital Signs',
    'blood_pressure': 'Blood Pressure',
    'heart_rate': 'Heart Rate',
    'temperature': 'Temperature',
    'weight': 'Weight',
    'height': 'Height',
    'pain_level': 'Pain Level',
    'symptoms': 'Symptoms',
    'examination': 'Examination',
    'assessment': 'Assessment',
    'plan': 'Plan',
    'objective': 'Objective',
    'subjective': 'Subjective',
    
    // Appointment Terms
    'appointment_date': 'Appointment Date',
    'appointment_time': 'Appointment Time',
    'duration': 'Duration',
    'appointment_type': 'Appointment Type',
    'provider': 'Provider',
    'status': 'Status',
    'scheduled': 'Scheduled',
    'confirmed': 'Confirmed',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no_show': 'No Show',
    'rescheduled': 'Rescheduled',
    
    // Settings
    'general_settings': 'General Settings',
    'security_settings': 'Security Settings',
    'notification_settings': 'Notification Settings',
    'language_preferences': 'Language Preferences',
    'timezone': 'Timezone',
    'theme': 'Theme',
    'dark_mode': 'Dark Mode',
    'light_mode': 'Light Mode',
    
    // Time & Date
    'today': 'Today',
    'yesterday': 'Yesterday',
    'tomorrow': 'Tomorrow',
    'this_week': 'This Week',
    'this_month': 'This Month',
    'this_year': 'This Year',
    'monday': 'Monday',
    'tuesday': 'Tuesday',
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday',
    'sunday': 'Sunday',
    
    // Status Messages
    'success': 'Success',
    'error': 'Error',
    'warning': 'Warning',
    'info': 'Information',
    'saved_successfully': 'Saved successfully',
    'deleted_successfully': 'Deleted successfully',
    'updated_successfully': 'Updated successfully',
    'operation_failed': 'Operation failed',
    'access_denied': 'Access denied',
    'not_found': 'Not found',
  },
  es: {
    // Navigation & General
    'dashboard': 'Panel de Control',
    'patients': 'Pacientes',
    'appointments': 'Citas',
    'calendar': 'Calendario',
    'conversations': 'Conversaciones',
    'opportunities': 'Oportunidades',
    'soap_notes': 'Notas SOAP',
    'forms': 'Formularios',
    'settings': 'Configuración',
    'my_profile': 'Mi Perfil',
    'logout': 'Cerrar Sesión',
    'search': 'Buscar',
    'filter': 'Filtrar',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'add': 'Agregar',
    'create': 'Crear',
    'update': 'Actualizar',
    'view': 'Ver',
    'close': 'Cerrar',
    'loading': 'Cargando...',
    'submit': 'Enviar',
    'back': 'Atrás',
    'next': 'Siguiente',
    'previous': 'Anterior',
    'yes': 'Sí',
    'no': 'No',
    
    // Authentication
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
    
    // Patient Management
    'patient_name': 'Nombre del Paciente',
    'patient_email': 'Correo del Paciente',
    'patient_phone': 'Teléfono del Paciente',
    'date_of_birth': 'Fecha de Nacimiento',
    'gender': 'Género',
    'address': 'Dirección',
    'medical_history': 'Historia Médica',
    'current_medications': 'Medicamentos Actuales',
    'allergies': 'Alergias',
    'emergency_contact': 'Contacto de Emergencia',
    'insurance_information': 'Información del Seguro',
    
    // Medical Terms
    'chief_complaint': 'Queja Principal',
    'diagnosis': 'Diagnóstico',
    'treatment_plan': 'Plan de Tratamiento',
    'vital_signs': 'Signos Vitales',
    'blood_pressure': 'Presión Arterial',
    'heart_rate': 'Frecuencia Cardíaca',
    'temperature': 'Temperatura',
    'weight': 'Peso',
    'height': 'Altura',
    'pain_level': 'Nivel de Dolor',
    'symptoms': 'Síntomas',
    'examination': 'Examen',
    'assessment': 'Evaluación',
    'plan': 'Plan',
    'objective': 'Objetivo',
    'subjective': 'Subjetivo',
    
    // Appointment Terms
    'appointment_date': 'Fecha de la Cita',
    'appointment_time': 'Hora de la Cita',
    'duration': 'Duración',
    'appointment_type': 'Tipo de Cita',
    'provider': 'Proveedor',
    'status': 'Estado',
    'scheduled': 'Programado',
    'confirmed': 'Confirmado',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
    'no_show': 'No Asistió',
    'rescheduled': 'Reprogramado',
    
    // Settings
    'general_settings': 'Configuración General',
    'security_settings': 'Configuración de Seguridad',
    'notification_settings': 'Configuración de Notificaciones',
    'language_preferences': 'Preferencias de Idioma',
    'timezone': 'Zona Horaria',
    'theme': 'Tema',
    'dark_mode': 'Modo Oscuro',
    'light_mode': 'Modo Claro',
    
    // Time & Date
    'today': 'Hoy',
    'yesterday': 'Ayer',
    'tomorrow': 'Mañana',
    'this_week': 'Esta Semana',
    'this_month': 'Este Mes',
    'this_year': 'Este Año',
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo',
    
    // Status Messages
    'success': 'Éxito',
    'error': 'Error',
    'warning': 'Advertencia',
    'info': 'Información',
    'saved_successfully': 'Guardado exitosamente',
    'deleted_successfully': 'Eliminado exitosamente',
    'updated_successfully': 'Actualizado exitosamente',
    'operation_failed': 'Operación fallida',
    'access_denied': 'Acceso denegado',
    'not_found': 'No encontrado',
  },
};

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

interface LanguageProviderProps {
  children: ReactNode;
}

export const EnhancedLanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en');
  const { profile, updateProfile } = useProfile();

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
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      availableLanguages 
    }}>
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