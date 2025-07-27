// 📍 Hook do zarządzania lokalizacjami spiżarni

import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from './useAuth';
import LokalizacjaService from '../services/LokalizacjaService';
import type { SpizarniaLokalizacja } from '../types';

export const useSpizarniaLokalizacje = (spizarniaId: string | null) => {
  const [lokalizacje, setLokalizacje] = useState<SpizarniaLokalizacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadLokalizacje = async () => {
      try {
        console.log('useSpizarniaLokalizacje: Loading lokalizacje for spizarniaId:', spizarniaId);
        
        if (!spizarniaId || !user?.uid) {
          console.log('useSpizarniaLokalizacje: Missing spizarniaId or user, setting empty array');
          setLokalizacje([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const data = await LokalizacjaService.getLokalizacje(spizarniaId, user.uid);
        console.log('useSpizarniaLokalizacje: Loaded lokalizacje:', data);
        
        // Jeśli brak lokalizacji (stara spiżarnia), użyj domyślnych
        if (data.length === 0) {
          console.log('useSpizarniaLokalizacje: No lokalizacje found, using defaults');
          setLokalizacje([
            { 
              id: 'fallback-lodowka', 
              nazwa: 'Lodówka', 
              ikona: '❄️', 
              kolor: '#3B82F6',
              opis: 'Główna komora chłodnicza',
              createdAt: Timestamp.fromDate(new Date())
            },
            { 
              id: 'fallback-zamrazarka', 
              nazwa: 'Zamrażarka', 
              ikona: '🧊', 
              kolor: '#1E40AF',
              opis: 'Komora zamrażająca',
              createdAt: Timestamp.fromDate(new Date())
            },
            { 
              id: 'fallback-szafka', 
              nazwa: 'Szafka', 
              ikona: '🗄️', 
              kolor: '#8B5CF6',
              opis: 'Szafka kuchenna lub spiżarnia',
              createdAt: Timestamp.fromDate(new Date())
            }
          ]);
        } else {
          setLokalizacje(data);
        }

      } catch (err) {
        console.error('useSpizarniaLokalizacje: Błąd ładowania lokalizacji:', err);
        setError(err instanceof Error ? err.message : 'Błąd ładowania lokalizacji');
        
        // Fallback - ustaw domyślne lokalizacje
        console.log('useSpizarniaLokalizacje: Using fallback lokalizacje');
        setLokalizacje([
          { 
            id: 'fallback-lodowka', 
            nazwa: 'Lodówka', 
            ikona: '❄️', 
            kolor: '#3B82F6',
            createdAt: Timestamp.fromDate(new Date())
          },
          { 
            id: 'fallback-zamrazarka', 
            nazwa: 'Zamrażarka', 
            ikona: '🧊', 
            kolor: '#1E40AF',
            createdAt: Timestamp.fromDate(new Date())
          },
          { 
            id: 'fallback-szafka', 
            nazwa: 'Szafka', 
            ikona: '🗄️', 
            kolor: '#8B5CF6',
            createdAt: Timestamp.fromDate(new Date())
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadLokalizacje();
  }, [spizarniaId, user?.uid]);

  return { lokalizacje, loading, error };
};
