import React, { createContext, useContext, useState, useEffect } from 'react';
import { Partner } from '../types';
import { coupleStore } from '../services/store';

interface AuthContextType {
  partners: Partner[];
  currentPartner: Partner | null;
  otherPartner: Partner | null;
  switchPartner: (partnerId: string) => void;
  updateCurrentPartner: (data: Partial<Partner>) => Promise<void>;
  refreshPartners: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partners, setPartners] = useState<Partner[]>(() => coupleStore.getPartners());
  const [currentPartnerId, setCurrentPartnerId] = useState<string>(() => {
    return localStorage.getItem('asmi_current_partner_id') || 'partner1';
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = coupleStore.subscribe(() => {
      setPartners(coupleStore.getPartners());
    });
    return unsubscribe;
  }, []);

  const switchPartner = (partnerId: string) => {
    setCurrentPartnerId(partnerId);
    localStorage.setItem('asmi_current_partner_id', partnerId);
  };

  const updateCurrentPartner = async (data: Partial<Partner>) => {
    if (!currentPartnerId) return;
    coupleStore.updatePartner(currentPartnerId, data);
  };

  const refreshPartners = async () => {
    setPartners(coupleStore.getPartners());
  };

  const currentPartner = partners.find((p) => p.id === currentPartnerId) || partners[0] || null;
  const otherPartner = partners.find((p) => p.id !== currentPartnerId) || partners[1] || null;

  return (
    <AuthContext.Provider
      value={{
        partners,
        currentPartner,
        otherPartner,
        switchPartner,
        updateCurrentPartner,
        refreshPartners,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
