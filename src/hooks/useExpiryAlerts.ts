// 🚨 Hook do zarządzania alertami o wygasających produktach

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { SpizarniaService } from '../services/SpizarniaService';
import { ProduktService } from '../services/ProduktService';
import type { Produkt } from '../types';

interface ExpiryAlerts {
  expired: number;
  expiring: number; // 0-2 dni
  soonExpiring: number; // 3-7 dni
  total: number;
  loading: boolean;
  error: string | null;
}

export const useExpiryAlerts = (): ExpiryAlerts => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ExpiryAlerts>({
    expired: 0,
    expiring: 0,
    soonExpiring: 0,
    total: 0,
    loading: true, // Startuj z loading: true
    error: null
  });

  const getDaysUntilExpiry = (dataWażności?: { toDate: () => Date } | Date): number => {
    if (!dataWażności) return 999;

    const today = new Date();
    const expiryDate = 'toDate' in dataWażności ? dataWażności.toDate() : dataWażności;
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const loadAlerts = async () => {
    if (!user?.uid) {
      // Jeśli nie ma użytkownika, po prostu zresetuj stan
      setAlerts({
        expired: 0,
        expiring: 0,
        soonExpiring: 0,
        total: 0,
        loading: false,
        error: null
      });
      return;
    }

    try {
      setAlerts(prev => ({ ...prev, loading: true, error: null }));

      // Pobierz wszystkie spiżarnie użytkownika
      const spiżarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
      
      let expired = 0;
      let expiring = 0;
      let soonExpiring = 0;

      // Przejdź przez wszystkie spiżarnie i produkty
      for (const spizarnia of spiżarnie) {
        try {
          const produkty = await ProduktService.getProdukty(spizarnia.id, user.uid);
          
          produkty.forEach((produkt: Produkt) => {
            const days = getDaysUntilExpiry(produkt.dataWażności);

            if (days < 0) {
              expired++;
            } else if (days <= 2) {
              expiring++;
            } else if (days <= 7) {
              soonExpiring++;
            }
          });
        } catch (spizarniaError) {
          console.warn(`Błąd ładowania produktów z spiżarni ${spizarnia.id}:`, spizarniaError);
          // Kontynuuj z innymi spiżarniami
        }
      }

      const total = expired + expiring + soonExpiring;

      setAlerts({
        expired,
        expiring,
        soonExpiring,
        total,
        loading: false,
        error: null
      });

    } catch (err) {
      console.error('Błąd ładowania alertów:', err);
      setAlerts(prev => ({
        ...prev,
        loading: false,
        error: 'Nie udało się załadować alertów'
      }));
    }
  };

  useEffect(() => {
    loadAlerts();
    
    // Odświeżaj alerty co 5 minut
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  return alerts;
};
