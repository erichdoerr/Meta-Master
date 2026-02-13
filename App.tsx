import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import { AppSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize settings from localStorage or defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ow2-meta-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ow2-meta-settings', JSON.stringify(newSettings));
  };

  // Simple route check for visual toggling since we are in a SPA
  const isSettingsOpen = location.pathname === '/settings';

  return (
      <Routes>
        <Route 
            path="/" 
            element={
                <Dashboard 
                    settings={settings} 
                    onOpenSettings={() => navigate('/settings')} 
                />
            } 
        />
        <Route 
            path="/settings" 
            element={
                <SettingsPage 
                    settings={settings} 
                    onSave={handleSaveSettings} 
                    onBack={() => navigate('/')} 
                />
            } 
        />
      </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
        <AppContent />
    </HashRouter>
  );
};

export default App;
