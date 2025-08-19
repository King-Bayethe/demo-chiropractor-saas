import React, { createContext, useContext, useState, useEffect } from 'react';

interface AISettings {
  masterToggle: boolean;
  smartTemplates: boolean;
  clinicalDecisionSupport: boolean;
  realtimeSuggestions: boolean;
  aiInsights: boolean;
}

interface AIContextType {
  settings: AISettings;
  updateSetting: (key: keyof AISettings, value: boolean) => void;
  isAIEnabled: (feature?: keyof Omit<AISettings, 'masterToggle'>) => boolean;
  quotaExceeded: boolean;
  setQuotaExceeded: (exceeded: boolean) => void;
}

const defaultSettings: AISettings = {
  masterToggle: true,
  smartTemplates: true,
  clinicalDecisionSupport: true,
  realtimeSuggestions: true,
  aiInsights: true,
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('ai-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    localStorage.setItem('ai-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AISettings, value: boolean) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // If master toggle is turned off, disable all features
      if (key === 'masterToggle' && !value) {
        return {
          ...newSettings,
          smartTemplates: false,
          clinicalDecisionSupport: false,
          realtimeSuggestions: false,
          aiInsights: false,
        };
      }
      
      return newSettings;
    });
  };

  const isAIEnabled = (feature?: keyof Omit<AISettings, 'masterToggle'>): boolean => {
    if (quotaExceeded) return false;
    if (!settings.masterToggle) return false;
    if (!feature) return true;
    return settings[feature];
  };

  return (
    <AIContext.Provider value={{
      settings,
      updateSetting,
      isAIEnabled,
      quotaExceeded,
      setQuotaExceeded,
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};