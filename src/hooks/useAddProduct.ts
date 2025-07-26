import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SpizarniaService } from '../services/SpizarniaService';
import { ProduktService } from '../services/ProduktService';
import { Timestamp } from 'firebase/firestore';
import type { ProduktStatus } from '../types';

interface ProductFormData {
  nazwa: string;
  kategoria: string;
  ilość: number;
  jednostka: string;
  dataWażności: string;
  lokalizacja: string;
  opis: string;
}

const initialFormData: ProductFormData = {
  nazwa: '',
  kategoria: 'Inne',
  ilość: 1,
  jednostka: 'szt' as const,
  dataWażności: '',
  lokalizacja: 'lodówka' as const,
  opis: ''
};

export const useAddProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spizarniaId, setSpizarniaId] = useState<string | null>(null);
  const [spizarniaNazwa, setSpizarniaNazwa] = useState<string>('');

  // Load spiżarnia data
  useEffect(() => {
    const loadSpizarnia = async () => {
      if (!user?.uid) return;

      try {
        const urlSpizarniaId = searchParams.get('spizarnia');
        
        if (urlSpizarniaId) {
          setSpizarniaId(urlSpizarniaId);
          const userSpizarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
          const spizarnia = userSpizarnie.find(s => s.id === urlSpizarniaId);
          if (spizarnia) {
            setSpizarniaNazwa(spizarnia.metadata.nazwa);
          }
        } else {
          const userSpizarnie = await SpizarniaService.getUserSpiżarnie(user.uid);
          if (userSpizarnie.length > 0) {
            setSpizarniaId(userSpizarnie[0].id);
            setSpizarniaNazwa(userSpizarnie[0].metadata.nazwa);
          }
        }
      } catch (err) {
        console.error('Błąd ładowania spiżarni:', err);
        setError('Błąd ładowania danych spiżarni');
      }
    };

    loadSpizarnia();
  }, [searchParams, user]);

  const handleInputChange = (field: keyof ProductFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string | number } }
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'ilość' ? Number(value) : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!spizarniaId || !user?.uid) {
      setError(`Brak danych spiżarni lub użytkownika. SpizarniaId: ${spizarniaId}, UserId: ${user?.uid}`);
      return;
    }

    if (!formData.nazwa.trim()) {
      setError('Nazwa produktu jest wymagana');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Przygotuj dane produktu
      const dataWażności = formData.dataWażności ? new Date(formData.dataWażności) : null;
      
      const nowyProdukt: {
        nazwa: string;
        kategoria: string;
        ilość: number;
        jednostka: 'szt' | 'kg' | 'l' | 'g' | 'ml';
        lokalizacja: 'lodówka' | 'zamrażarka' | 'szafka';
        status: ProduktStatus;
        dataWażności?: Timestamp;
        notatki?: string;
      } = {
        nazwa: formData.nazwa.trim(),
        kategoria: formData.kategoria,
        ilość: formData.ilość,
        jednostka: formData.jednostka as 'szt' | 'kg' | 'l' | 'g' | 'ml',
        lokalizacja: formData.lokalizacja as 'lodówka' | 'zamrażarka' | 'szafka',
        status: 'dostępny' as ProduktStatus
      };

      // Dodaj opcjonalne pola tylko jeśli mają wartość
      if (dataWażności) {
        nowyProdukt.dataWażności = Timestamp.fromDate(dataWażności);
      }
      
      if (formData.opis.trim()) {
        nowyProdukt.notatki = formData.opis.trim();
      }

      // Dodaj produkt do Firestore
      console.log('AddProductPage: Dodawanie produktu do spiżarni:', spizarniaId);
      console.log('AddProductPage: Dane produktu:', nowyProdukt);
      await ProduktService.addProdukt(spizarniaId, user.uid, nowyProdukt);

      // Reset formularza
      setFormData(initialFormData);

      // Przekieruj z powrotem do listy produktów  
      navigate(`/lista?spizarnia=${spizarniaId}`);

    } catch (err) {
      console.error('Błąd dodawania produktu:', err);
      if (err instanceof Error) {
        setError(`Błąd podczas dodawania produktu: ${err.message}`);
      } else {
        setError('Błąd podczas dodawania produktu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScanBarcode = () => {
    // TODO: Implementacja skanowania kodów kreskowych
    setError('Skanowanie kodów kreskowych będzie dostępne wkrótce');
  };

  const handleGoBack = () => {
    if (spizarniaId) {
      navigate(`/lista?spizarnia=${spizarniaId}`);
    } else {
      navigate('/spiżarnie');
    }
  };

  const isFormValid = formData.nazwa.trim().length > 0;

  return {
    formData,
    loading,
    error,
    spizarniaNazwa,
    isFormValid,
    handleInputChange,
    handleSubmit,
    handleScanBarcode,
    handleGoBack
  };
};
