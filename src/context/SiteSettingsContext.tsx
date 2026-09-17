import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSiteSettings, DEFAULT_SETTINGS } from '../lib/siteSettingsService';
import type { SiteSettings } from '../lib/siteSettingsService';

interface SiteSettingsContextType {
    settings: SiteSettings;
    isLoading: boolean;
    refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    settings: DEFAULT_SETTINGS, // Immediately use default to prevent skeleton/flash
    isLoading: true,
    refreshSettings: async () => {},
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const data = await getSiteSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to refresh site settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void refreshSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
